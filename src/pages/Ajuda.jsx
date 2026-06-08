import { HelpCircle, KeyRound, Compass, PlusCircle, ListChecks, ClipboardList, Search, Briefcase, BarChart2, LifeBuoy } from 'lucide-react'

// Conteúdo espelha docs/faq-como-usar.md — mantenha os dois em sincronia ao editar.
const SECOES = [
  {
    titulo: 'Acesso e senha',
    icone: KeyRound,
    itens: [
      { q: 'Como eu entro no sistema?', a: 'Abra o endereço do sistema, digite seu e-mail e senha e clique em Entrar. Funciona no computador e no celular, pelo navegador — não precisa instalar nada.' },
      { q: 'Esqueci minha senha. E agora?', a: 'Na tela de login, clique em "Esqueci minha senha", informe seu e-mail e envie. Você recebe um link por e-mail; abra-o e cadastre uma senha nova.' },
      { q: 'Como troco minha senha estando logada?', a: 'Clique no seu nome (canto inferior do menu, ou ícone de perfil no celular) → Perfil. Informe a senha atual e a nova senha.' },
      { q: 'Quem vê o quê?', a: 'Thainá (atendimento): cadastra parcelas, acompanha cobranças e cuida das tarefas do dia. Rose (dona): vê tudo, incluindo Relatórios e o Painel da Rose. Vendedor: vê só a Minha Carteira.' },
    ],
  },
  {
    titulo: 'O menu',
    icone: Compass,
    itens: [
      { q: 'Para que serve cada item do menu?', a: 'Parcelas: tela principal, lista tudo em cobrança. Tarefas do dia: o que precisa de atenção hoje (comece por aqui). Nova Parcela: cadastrar uma cobrança. Relatórios (só Rose): visão geral por período. Minha Carteira: clientes em aberto, com histórico e anotações.' },
    ],
  },
  {
    titulo: 'Cadastrar uma cobrança',
    icone: PlusCircle,
    itens: [
      { q: 'Como cadastro uma parcela para cobrar?', a: 'Clique em Nova Parcela (abre um painel lateral). Preencha nome e WhatsApp do cliente, CPF, seguradora, número e valor da parcela, vencimento, tipo de pagamento (boleto, débito automático ou cartão) e anexe o boleto quando houver. Clique em Salvar.' },
      { q: 'O que acontece logo depois que salvo?', a: 'O sistema dispara sozinho a mensagem de cobrança pelo WhatsApp do cliente, já com o boleto anexado e o texto oficial conforme o tipo de pagamento. A parcela passa para "Em cobrança". Você não precisa enviar nada manualmente.' },
      { q: 'O texto muda conforme o tipo de pagamento?', a: 'Sim. Boleto: lembrete de boleto em aberto. Débito automático: aviso de que o débito não passou e segue boleto. Cartão: aviso de que o cartão não autorizou e segue boleto. Em todos, a mensagem é assinada pela Thainá e vai com o boleto anexado.' },
      { q: 'Onde vejo o que cadastrei hoje?', a: 'No próprio painel de Nova Parcela existe a lista "Cadastradas hoje", com tudo que entrou no dia.' },
    ],
  },
  {
    titulo: 'Acompanhar as cobranças',
    icone: ClipboardList,
    itens: [
      { q: 'Como acompanho o andamento?', a: 'Na tela Parcelas você tem a visão de Tabela (lista completa, com filtros por status e seguradora) e a visão Por status (Kanban), com colunas mostrando em que etapa cada cobrança está.' },
      { q: 'O que cada status significa?', a: 'A cobrar: cadastrada, ainda não entrou em cobrança. Em cobrança: a mensagem já foi enviada, aguardando o cliente. Pago: cliente pagou e a parcela foi baixada. Escalado: passou para o vendedor resolver.' },
    ],
  },
  {
    titulo: 'Tarefas do dia',
    icone: ListChecks,
    itens: [
      { q: 'Por onde começo o dia?', a: 'Pela tela Tarefas do dia. Ela já mostra no topo o que é mais urgente, principalmente os casos de cobertura em risco.' },
      { q: 'O que é "cobertura em risco"?', a: 'É quando a parcela passou de 15 dias de atraso. Nesse ponto o seguro pode ser suspenso, então esses casos aparecem destacados e em primeiro lugar.' },
      { q: 'O que posso fazer em cada tarefa?', a: 'Cobrar de novo: dispara uma nova mensagem automática com o boleto. WhatsApp: abre o WhatsApp Web na conversa do cliente, com a mensagem pronta, para você falar manualmente. Marcar paga: quando o cliente já pagou. Escalar: passa o caso para o vendedor. Clicando no card você abre o detalhe completo.' },
      { q: 'Diferença entre "Cobrar de novo" e "WhatsApp"?', a: 'Cobrar de novo = o sistema envia sozinho, igual ao envio automático. WhatsApp = abre a conversa para você escrever/enviar na mão, útil quando quer conversar de verdade com o cliente.' },
    ],
  },
  {
    titulo: 'Detalhe da parcela',
    icone: Search,
    itens: [
      { q: 'O que encontro na tela de detalhe?', a: 'O histórico de contatos (o que já foi enviado e quando), o botão Abrir no WhatsApp, o Ver boleto, e as ações para marcar como paga, escalar ou remarcar.' },
    ],
  },
  {
    titulo: 'Minha Carteira',
    icone: Briefcase,
    itens: [
      { q: 'Para que serve a Carteira?', a: 'Mostra os clientes com parcelas em aberto, agrupados por cliente e ordenados pelo maior valor em aberto. É a visão do vendedor sobre quem precisa de atenção.' },
      { q: 'Como falo com um cliente pela Carteira?', a: 'Clique no cliente para abrir o painel lateral e use o botão verde "Falar no WhatsApp" — abre a conversa com a mensagem pronta.' },
      { q: 'Como anoto uma informação sobre o cliente?', a: 'No mesmo painel, escreva no campo "Observação sobre o cliente" e clique em Salvar observação. A anotação fica gravada no cliente e reaparece toda vez que você abrir esse cliente.' },
    ],
  },
  {
    titulo: 'Relatórios (só Rose)',
    icone: BarChart2,
    itens: [
      { q: 'Para que serve?', a: 'Para ver o quadro geral da cobrança: quanto está em aberto, quanto já foi recuperado, filtrando por período, seguradora ou status.' },
      { q: 'Como uso?', a: 'Defina os filtros, clique em Consultar, veja os totais e a lista. Para levar à contabilidade, clique em Exportar CSV (abre no Excel/Planilhas). Não é a tela do dia a dia — para cadastrar e cobrar, use Parcelas e Tarefas do dia.' },
    ],
  },
  {
    titulo: 'Dúvidas e problemas comuns',
    icone: LifeBuoy,
    itens: [
      { q: 'Não sei se a mensagem foi enviada.', a: 'Veja o status da parcela: se está "Em cobrança", a mensagem saiu. No detalhe, o histórico mostra o envio.' },
      { q: 'A mensagem não chegou para o cliente.', a: 'Confira se o número de WhatsApp foi digitado certo (com DDD). Se estiver certo e ainda assim não chegou, use o botão WhatsApp para falar manualmente e avise quem cuida do sistema.' },
      { q: 'A página ficou "carregando" e não abre.', a: 'Atualize a página (F5 no computador, ou puxe para baixo no celular). Se persistir, saia e entre de novo.' },
      { q: 'Posso usar no celular?', a: 'Sim. No celular o menu fica embaixo e o perfil no ícone de usuário. Tudo funciona igual.' },
      { q: 'Marquei algo errado (paga/escalada por engano).', a: 'Abra o detalhe da parcela e ajuste o status novamente. Em caso de dúvida, escale ou avise quem cuida do sistema.' },
    ],
  },
]

export default function Ajuda() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface)]">
        <h1 className="font-display font-semibold text-2xl text-[var(--text-primary)] flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-[var(--brand)]" /> Ajuda
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Guia rápido de como usar o sistema. Procure a pergunta que você tem agora.
        </p>
      </div>

      <div className="px-4 md:px-6 py-6 flex flex-col gap-6 max-w-3xl">
        {SECOES.map(({ titulo, icone: Icon, itens }) => (
          <section key={titulo} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-raised)]">
              <Icon className="w-4 h-4 text-[var(--brand)] shrink-0" />
              <h2 className="font-semibold text-sm text-[var(--text-primary)]">{titulo}</h2>
            </div>
            <div className="flex flex-col">
              {itens.map(({ q, a }) => (
                <details key={q} className="group border-b border-[var(--border)] last:border-b-0">
                  <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-raised)] transition-colors">
                    {q}
                    <span className="text-[var(--text-muted)] transition-transform group-open:rotate-45 text-lg leading-none shrink-0">+</span>
                  </summary>
                  <p className="px-4 pb-4 -mt-1 text-sm text-[var(--text-secondary)] leading-relaxed">
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}

        <p className="text-xs text-[var(--text-muted)] text-center pb-2">
          Dúvida que não está aqui? Anote a pergunta para incluirmos neste guia.
        </p>
      </div>
    </div>
  )
}
