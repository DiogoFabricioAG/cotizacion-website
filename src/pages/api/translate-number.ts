import Groq from "groq-sdk";

export const prerender = false;

export const POST = async ({ request }) => {
  try {
    const { total, apiKey } = await request.json();

    const finalApiKey = apiKey || import.meta.env.GROQ_API_KEY;

    if (!finalApiKey) {
      return new Response(JSON.stringify({ error: "Falta configurar la API Key de Groq." }), { status: 400 });
    }

    if (total === undefined || total === null) {
      return new Response(JSON.stringify({ error: "Total is required" }), { status: 400 });
    }

    const groq = new Groq({
      apiKey: finalApiKey,
    });

    // Asegurarse de que el número tiene formato con 2 decimales para el prompt
    const totalFormat = Number(total).toFixed(2);

    const systemPrompt = `Eres un conversor matemático muy estricto. Tu única tarea es convertir un número con decimales a texto legal de moneda en Perú.
Reglas estrictas:
1. SIEMPRE devuelve ÚNICAMENTE el texto resultante. Cero explicaciones, cero formatos markdown, nada más que el texto.
2. Formato: "[Número en letras] y [Céntimos]/100 soles".
3. Capitaliza la primera letra de la respuesta.
4. Ejemplo: Si recibes "680.00" respondes "Seiscientos ochenta y 00/100 soles".
5. Ejemplo: Si recibes "1545.50" respondes "Un mil quinientos cuarenta y cinco y 50/100 soles".`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: totalFormat }
      ],
      model: "llama-3.1-8b-instant", // Modelo más pequeño y rápido para esta tarea super simple
      temperature: 0.1,
      max_tokens: 50,
    });

    const responseContent = chatCompletion.choices[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ content: responseContent }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error from Groq API:", error);
    return new Response(JSON.stringify({ error: "Error en la API de Groq o llave incorrecta." }), { status: 500 });
  }
};