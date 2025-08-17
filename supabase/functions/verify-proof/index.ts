import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://deno.land/x/openai@v4.33.0/mod.ts';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

serve(async (req) => {
  const { record: task } = await req.json()

  console.log(`Verifying proof for task: ${task.id}`)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const proofData = JSON.parse(task.proof_url);
    const proofUrls = proofData.urls;
    const proofDescription = proofData.description;

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that verifies task proofs. Your response must be a JSON object with two keys: "status" and "reason". The "status" can be "verified" or "failed". The "reason" should be a short explanation for the status. Be very strict. Only approve proofs that are clearly and unambiguously correct.`
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Please verify if the following proof is valid for the task: "${task.title}". Task description: "${task.description}". User's description: "${proofDescription}".` },
            ...proofUrls.map((url: string) => ({ type: "image_url", image_url: { url } })),
          ],
        },
      ],
      max_tokens: 300,
    });

    const verificationResult = JSON.parse(response.choices[0].message.content!);
    const { status, reason } = verificationResult;

    if (status === 'verified') {
      await supabase
        .from('tasks')
        .update({ status: 'verified', verification_feedback: reason })
        .eq('id', task.id)

      // Create reward if verified
      await supabase.from('rewards').insert([{ task_id: task.id, user_id: task.user_id, amount: task.due_coins, coupon_code: `REWARD-${task.id.substring(0,8)}` }])
    } else {
      await supabase
        .from('tasks')
        .update({ status: 'pending', verification_feedback: reason })
        .eq('id', task.id)
    }

    return new Response(
      JSON.stringify({ message: `Task ${task.id} updated to ${status}` }),
      { headers: { 'Content-Type': 'application/json' } },
    )

  } catch (error) {
    console.error('Error verifying proof:', error);
    await supabase
        .from('tasks')
        .update({ status: 'pending', verification_feedback: 'Error during AI verification.' })
        .eq('id', task.id)

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
