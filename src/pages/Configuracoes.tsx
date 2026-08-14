import { BookOpen, ChevronDown, ClipboardCheck, Cpu, Download, FileText, Gauge, ListChecks, Settings, ShieldCheck, Workflow, type LucideIcon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';

type ManualStep = { title: string; detail: string };
type ManualItem = { title: string; summary: string; description: string; path: string[]; steps: ManualStep[]; icon: LucideIcon };
type ManualImage = { src: string; caption: string };

const manualItems: ManualItem[] = [
  { title: 'Painel Principal — como usar', summary: 'Veja um resumo rápido da situação das suas notas fiscais.', description: 'O Painel Principal reúne as informações mais importantes em uma única tela. Ele mostra quantidades, valores, alertas e as notas mais recentes para ajudar você a decidir o que precisa ser conferido primeiro.', path: ['Painel Principal', 'Escolher período', 'Ver indicadores', 'Abrir a lista'], steps: [{ title: 'Abra o Painel Principal', detail: 'Clique em “Painel Principal” no menu do lado esquerdo.' }, { title: 'Escolha o período', detail: 'Use os filtros de data para mostrar somente o mês ou intervalo que deseja analisar.' }, { title: 'Leia os indicadores', detail: 'Veja os cartões de quantidade, valores e alertas. Eles apresentam um resumo das notas encontradas.' }, { title: 'Acesse os detalhes', detail: 'Clique no indicador ou na nota desejada para abrir a lista correspondente e continuar a conferência.' }], icon: Gauge },
  { title: 'Serviços tomados — como usar', summary: 'Confira as notas dos serviços que sua empresa contratou ou recebeu.', description: 'Nesta tela ficam as notas emitidas por fornecedores para a sua empresa. Você pode conferir valores, impostos, documentos e possíveis alertas antes de concluir a análise.', path: ['Serviços tomados', 'Aplicar filtros', 'Abrir uma nota', 'Conferir e salvar'], steps: [{ title: 'Entre em Serviços tomados', detail: 'No menu lateral, clique em “Serviços tomados”. A lista das notas recebidas será exibida.' }, { title: 'Encontre a nota', detail: 'Use a busca ou os filtros de período, fornecedor e situação para reduzir a lista.' }, { title: 'Abra os detalhes', detail: 'Clique na linha da nota desejada para consultar valores, impostos, documentos e alertas.' }, { title: 'Faça a conferência', detail: 'Revise as informações, informe o responsável ou uma observação quando necessário e salve a situação da conferência.' }], icon: ClipboardCheck },
  { title: 'Serviços prestados — como usar', summary: 'Acompanhe as notas emitidas pela sua empresa para clientes.', description: 'Aqui você encontra os serviços prestados pela sua empresa. A tela facilita a conferência das notas emitidas, dos valores e da situação de cada documento.', path: ['Serviços prestados', 'Localizar cliente', 'Abrir uma nota', 'Conferir dados'], steps: [{ title: 'Entre em Serviços prestados', detail: 'Clique em “Serviços prestados” no menu lateral para ver as notas emitidas pela empresa.' }, { title: 'Localize a nota', detail: 'Pesquise pelo número da nota ou pelo cliente. Se precisar, ajuste o período e os demais filtros.' }, { title: 'Abra os detalhes', detail: 'Clique na nota para visualizar os dados completos e os arquivos disponíveis.' }, { title: 'Confira as informações', detail: 'Revise cliente, valores e situação da nota. Registre a conferência quando essa ação estiver disponível.' }], icon: ClipboardCheck },
  { title: 'Todas as notas — como usar', summary: 'Consulte todas as notas reunidas em uma única lista.', description: 'Esta opção mostra notas de serviços tomados e prestados juntas. É indicada para uma busca geral, sem precisar escolher primeiro o tipo da nota.', path: ['Todas as notas', 'Buscar ou filtrar', 'Selecionar nota', 'Ver detalhes'], steps: [{ title: 'Abra Todas as notas', detail: 'Clique em “Todas as notas” no menu lateral para carregar a relação completa.' }, { title: 'Faça uma busca', detail: 'Digite o número da nota, nome ou CNPJ. Você também pode combinar os filtros disponíveis.' }, { title: 'Confira o resultado', detail: 'Observe o tipo, a situação, o valor e os alertas mostrados na lista.' }, { title: 'Abra a nota', detail: 'Clique na linha desejada para consultar todos os dados e baixar os documentos disponíveis.' }], icon: FileText },
  { title: 'Motor ADN — como usar', summary: 'Busque novas notas fiscais disponíveis para a empresa.', description: 'O Motor ADN consulta novas notas da empresa e traz os documentos encontrados para o portal. Para funcionar, a empresa precisa ter um certificado digital válido cadastrado.', path: ['Motor ADN', 'Escolher empresa', 'Escolher certificado', 'Iniciar com filtros'], steps: [{ title: 'Confirme o certificado', detail: 'Antes de começar, verifique na área “Certificados” se existe um certificado ativo e dentro da validade.' }, { title: 'Abra o Motor ADN', detail: 'Clique em “Motor ADN” e, em “Filtros de início”, escolha a empresa que deseja consultar.' }, { title: 'Defina a consulta', detail: 'Selecione o certificado e ajuste o limite somente se precisar. Se não selecionar, o sistema usa os itens elegíveis.' }, { title: 'Inicie a busca', detail: 'Clique em “Iniciar com filtros”. Aguarde a confirmação e acompanhe o andamento na Fila de consultas.' }], icon: Cpu },
  { title: 'Fila de consultas — como usar', summary: 'Acompanhe as consultas que estão aguardando ou em andamento.', description: 'A Fila mostra o que o sistema está processando. Você consegue saber se uma consulta está esperando, em execução, concluída ou se encontrou algum problema.', path: ['Fila de consultas', 'Ver situação', 'Aguardar conclusão', 'Consultar resultado'], steps: [{ title: 'Abra a Fila de consultas', detail: 'Clique em “Fila de consultas” no menu lateral depois de iniciar uma busca no Motor ADN.' }, { title: 'Veja a situação', detail: 'Localize a consulta e observe se ela está pendente, em andamento, concluída ou com erro.' }, { title: 'Aguarde o processamento', detail: 'Enquanto estiver em andamento, deixe o sistema concluir. Use “Atualizar” no topo para buscar a situação mais recente.' }, { title: 'Confira o resultado', detail: 'Quando terminar, consulte as notas encontradas em “Todas as notas” ou veja mais informações no Histórico.' }], icon: Workflow },
  { title: 'Histórico — como usar', summary: 'Consulte o resultado das buscas e atividades já realizadas.', description: 'O Histórico guarda as consultas anteriores. Use esta tela para confirmar quando uma busca foi feita, qual foi o resultado e se o processamento terminou corretamente.', path: ['Histórico', 'Usar filtros', 'Escolher processo', 'Ver detalhes'], steps: [{ title: 'Abra o Histórico', detail: 'Clique em “Histórico” no menu lateral para visualizar os processos já executados.' }, { title: 'Filtre os resultados', detail: 'Use a situação ou outros filtros disponíveis para encontrar uma consulta específica.' }, { title: 'Escolha um processo', detail: 'Clique no processo desejado para abrir as informações da execução.' }, { title: 'Entenda o resultado', detail: 'Confira início, fim e situação. Se houver falha, leia a mensagem apresentada para saber o que precisa ser corrigido.' }], icon: ListChecks },
  { title: 'Certificados — como usar', summary: 'Cadastre o certificado necessário para consultar as notas.', description: 'O certificado digital permite que o sistema consulte os documentos da empresa com segurança. Nesta tela você pode enviar o arquivo, informar a senha, testar o acesso e acompanhar a validade.', path: ['Certificados', 'Selecionar arquivo', 'Informar senha', 'Cadastrar e testar'], steps: [{ title: 'Abra Certificados', detail: 'Clique em “Certificados” no menu lateral e localize o formulário de cadastro.' }, { title: 'Escolha o arquivo', detail: 'Selecione o certificado digital da empresa no formato aceito pelo sistema.' }, { title: 'Informe os dados', detail: 'Digite um nome para identificar o certificado e informe a senha correta do arquivo.' }, { title: 'Cadastre e teste', detail: 'Envie o certificado e depois clique em “Testar”. Confirme se ele aparece como ativo e verifique a data de validade.' }], icon: ShieldCheck },
  { title: 'Manual — como usar', summary: 'Encontre explicações simples sobre cada área do portal.', description: 'Você está no Manual do sistema. Cada card apresenta um resumo, um caminho visual e as etapas necessárias para usar aquela parte do portal.', path: ['Manual', 'Escolher assunto', 'Abrir o card', 'Seguir as etapas'], steps: [{ title: 'Abra o Manual', detail: 'Clique em “Manual” no menu lateral sempre que tiver uma dúvida.' }, { title: 'Escolha o assunto', detail: 'Localize o card que possui o mesmo nome da área que você deseja aprender.' }, { title: 'Abra a explicação', detail: 'Clique no card para visualizar o resumo, o caminho na tela e o passo a passo.' }, { title: 'Siga a sequência', detail: 'Realize as etapas na ordem indicada. Clique novamente no card quando quiser fechar.' }], icon: Settings },
];

const manualImagesByIndex: ManualImage[][] = [
  [
    { src: '/manual/screens/painel-visao-geral.png', caption: 'Visão geral do Painel Principal, com atalhos, situação do Motor ADN e indicadores da operação.' },
    { src: '/manual/screens/painel-filtros-notas.png', caption: 'Área de filtros e lista de notas consultadas exibida mais abaixo no Painel Principal.' },
  ],
  [
    { src: '/manual/screens/tomados-visao-geral.png', caption: 'Resumo e filtros de Serviços tomados, onde ficam as notas recebidas de fornecedores.' },
    { src: '/manual/screens/tomados-filtros-tabela.png', caption: 'Filtros avançados e tabela operacional usados para localizar e abrir uma nota tomada.' },
  ],
  [
    { src: '/manual/screens/prestados-visao-geral.png', caption: 'Resumo e filtros de Serviços prestados, com os indicadores das notas emitidas.' },
    { src: '/manual/screens/prestados-tabela.png', caption: 'Tabela operacional de Serviços prestados, onde cada linha representa uma nota emitida.' },
  ],
  [
    { src: '/manual/screens/todas-notas-filtros.png', caption: 'Tela Todas as notas com download em lote e filtros para encontrar documentos.' },
  ],
  [{ src: '/manual/screens/motor-adn.png', caption: 'Motor ADN com os filtros de início e a seleção das empresas e certificados que serão consultados.' }],
  [{ src: '/manual/screens/fila-consultas.png', caption: 'Fila de consultas com os processos em andamento, pendentes, concluídos ou com erro.' }],
  [
    { src: '/manual/screens/historico-resumo.png', caption: 'Resumo do Histórico por empresa, com total de notas, divergências e última execução.' },
    { src: '/manual/screens/historico-processos.png', caption: 'Tabela detalhada do Histórico, com situação, início, fim e mensagem de erro de cada processo.' },
  ],
  [{ src: '/manual/screens/certificados.png', caption: 'Cadastro de certificado à esquerda e certificados já cadastrados à direita.' }],
  [{ src: '/manual/screens/painel-visao-geral.png', caption: 'Use o menu lateral para entrar em uma área e volte ao Manual sempre que precisar.' }],
];

export function Configuracoes() {
  const showCompleteManual = new URLSearchParams(window.location.search).has('manual-completo');

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader eyebrow="Ajuda" title="Manual do sistema" description="Entenda de forma simples para que serve cada opção do menu e como começar a usá-la." />
      <div className="mb-6 flex justify-end print:hidden">
        <a
          href="/manual/manual-completo-portal-nfse.pdf"
          download="Manual-completo-Portal-NFS-e.pdf"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Download size={18} />
          Baixar manual completo
        </a>
      </div>
      <Card className="mb-6 flex items-start gap-4 border-accent/20 bg-accent/5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent"><BookOpen size={22} /></span>
        <div><h2 className="font-bold text-textStrong">Como consultar este manual</h2><p className="mt-1 text-sm leading-6 text-textSoft">Clique em um dos cards abaixo para abrir a explicação. Você pode fechar o card clicando nele novamente.</p></div>
      </Card>
      <div className="space-y-3">
        {manualItems.map((item, itemIndex) => {
          const Icon = item.icon;
          const images = manualImagesByIndex[itemIndex] || [];
          return (
            <details open={showCompleteManual} key={item.title} className="group overflow-hidden rounded-2xl border border-borderSoft bg-panel shadow-card transition-colors open:border-accent/30">
              <summary className="flex cursor-pointer list-none items-center gap-4 p-4 marker:content-none hover:bg-panel2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent sm:p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent"><Icon size={22} /></span>
                <span className="min-w-0 flex-1"><span className="block font-bold text-textStrong">{item.title}</span><span className="mt-1 block text-sm leading-5 text-textSoft">{item.summary}</span></span>
                <ChevronDown className="shrink-0 text-textSoft transition-transform group-open:rotate-180" size={20} />
              </summary>
              <div className="border-t border-borderSoft bg-panel2/40 px-5 pb-5 pt-4 sm:pl-20 sm:pr-8">
                <p className="text-sm leading-7 text-textBody">{item.description}</p>

                <div className="mt-5 space-y-4">
                  {images.map((image, imageIndex) => (
                    <figure key={image.src} className="overflow-hidden rounded-xl border border-borderSoft bg-slate-950/40">
                      <a href={image.src} target="_blank" rel="noreferrer" title="Clique para ampliar a imagem">
                        <img className="block h-auto w-full cursor-zoom-in" src={image.src} alt={`${item.title}: imagem ${imageIndex + 1}`} loading="lazy" decoding="async" />
                      </a>
                      <figcaption className="border-t border-borderSoft px-4 py-3 text-xs leading-5 text-textSoft">
                        <strong className="text-textBody">Imagem {imageIndex + 1}.</strong> {image.caption} Clique na imagem para ampliar.
                      </figcaption>
                    </figure>
                  ))}
                </div>

                <div className="mt-5 overflow-hidden rounded-xl border border-borderSoft bg-panel" aria-label={`Caminho visual: ${item.path.join(', ')}`}>
                  <div className="flex items-center gap-1.5 border-b border-borderSoft bg-slate-950/30 px-3 py-2" aria-hidden="true">
                    <span className="h-2 w-2 rounded-full bg-danger/70" /><span className="h-2 w-2 rounded-full bg-warning/70" /><span className="h-2 w-2 rounded-full bg-success/70" />
                    <span className="ml-2 text-[11px] font-semibold uppercase tracking-wider text-textSoft">Caminho na tela</span>
                  </div>
                  <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
                    {item.path.map((label, index) => (
                      <div key={label} className="contents">
                        <span className={index === item.path.length - 1 ? 'rounded-lg border border-accent/30 bg-accent/15 px-3 py-2 text-center text-xs font-bold text-accent' : 'rounded-lg border border-borderSoft bg-panel2 px-3 py-2 text-center text-xs font-semibold text-textBody'}>{label}</span>
                        {index < item.path.length - 1 ? <span className="rotate-90 text-center text-textSoft sm:rotate-0" aria-hidden="true">→</span> : null}
                      </div>
                    ))}
                  </div>
                </div>

                <h3 className="mt-6 text-base font-bold text-textStrong">Passo a passo</h3>
                <ol className="mt-4 space-y-4">
                  {item.steps.map((step, index) => (
                    <li key={step.title} className="flex gap-4">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-extrabold text-slate-950">{index + 1}</span>
                      <div className="pt-0.5"><h4 className="text-sm font-bold text-textStrong">{step.title}</h4><p className="mt-1 text-sm leading-6 text-textSoft">{step.detail}</p></div>
                    </li>
                  ))}
                </ol>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
