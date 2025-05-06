"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post('/api/chat', async (req, res) => {
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
        const requestOptions = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`, // Usa a chave da API
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
        const response = await (0, node_fetch_1.default)('https://openrouter.ai/api/v1/chat/completions', requestOptions);
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
        const data = (await response.json());
        console.log("Resposta da API do OpenRouter:", data);
        const resposta = data.choices[0]?.message?.content || "Sem resposta do modelo.";
        res.setHeader('Content-Type', 'application/json');
        console.log('Enviando resposta para o cliente:', resposta);
        res.json(resposta);
    }
    catch (error) {
        console.error('Erro ao processar a requisição (dentro do try):', error);
        res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
    }
});
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
//# sourceMappingURL=index.js.map