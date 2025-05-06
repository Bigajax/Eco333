import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch, { RequestInit } from 'node-fetch';

interface OpenRouterResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

const app = express();
const port = process.env.PORT || 3001;

const corsOptions = {
    origin: 'https://eco-2-lac.vercel.app', // A URL CORRETA DO SEU FRONTEND
    methods: 'POST',
    allowedHeaders: 'Content-Type,Authorization',
};

console.log('Configuração de CORS:', corsOptions); // LOG DA CONFIGURAÇÃO DO CORS
app.use(cors(corsOptions));
app.use(express.json());

app.post('/api/chat', async (req: express.Request, res: express.Response) => {
    const { message } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = 'mistralai/mistral-tiny'; // Alterado para um modelo gratuito

    // Imprime a chave da API para verificação
    console.log('OPENROUTER_API_KEY:', apiKey);
    console.log('Modelo sendo usado:', model); // Adicionado para verificar o modelo

    // Verifica se a chave da API está configurada
    if (!apiKey) {
        return res.status(500).json({ error: 'Chave da API do OpenRouter não configurada no servidor.' });
    }

    try {
        console.log('Iniciando chamada para OpenRouter...');
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,   // Usa a chave da API
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: `Você é a ECO — uma inteligência emocional reflexiva, criada para conversar com pessoas de forma sincera, profunda e acolhedora.

Sua missão não é dar conselhos prontos, mas oferecer presença. Você escuta com atenção, responde com palavras humanas, tranquilas e verdadeiras.

Use uma linguagem simples, direta e sensível. Não seja robótica, nem excessivamente poética. Fale como alguém que está ali, do lado, ouvindo com respeito.

Quando o usuário estiver confuso, com dor, ou sem palavras, você ajuda ele a nomear o que sente — sem pressionar, sem parecer terapeuta.

Você pode perguntar:
– “Quer me contar como foi o seu dia, sem pressa?”
– “Teve algo que pesou no coração hoje?”
– “O que você sente que precisa ser ouvido agora?”

E quando responder, lembre:
– Não tente resolver a dor. Acolha.
– Não apresse a jornada. Acompanhe.
– Não tenha pressa em ser útil. Só seja presente.`,
                    },
                    { role: 'user', content: message },
                ],
            }),
        };

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', requestOptions);
        console.log('Chamada para OpenRouter concluída. Status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro na chamada da API do OpenRouter:', errorData);
            return res.status(response.status).json({
                error: `Erro ao chamar a API do OpenRouter: ${response.statusText}`,
                details: errorData,
            });
        }

        console.log('Processando resposta JSON...');
        const data = (await response.json()) as OpenRouterResponse;
        console.log("Resposta da API do OpenRouter:", data);
        const resposta = data.choices[0]?.message?.content || "Sem resposta do modelo.";
        res.setHeader('Content-Type', 'application/json');
        console.log('Enviando resposta para o cliente:', resposta);
        res.json(resposta);
    } catch (error: any) {
        console.error('Erro ao processar a requisição (dentro do try):', error);
        res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});