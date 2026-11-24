import { Modal } from '../../components/ui/Modal';

/** Ajuda rápida, sempre à mão no cabeçalho: o que cada parte da tela faz e os atalhos de teclado. */
export function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Como usar o CESAR Hub" onClose={onClose} wide>
      <ul className="dialog__body help">
        <li>
          <strong>Abrir um serviço.</strong> Clique no card: o serviço abre em uma nova aba.
        </li>
        <li>
          <strong>Orientações.</strong> O primeiro card de cada área resume onde acessar cada serviço e a quem procurar.
          Em “Detalhes e anotações” você vê o passo a passo e guarda as suas anotações.
        </li>
        <li>
          <strong>Buscar.</strong> Digite o nome, o assunto ou o responsável. Atalhos: <kbd>/</kbd> vai para a busca e <kbd>Esc</kbd> limpa.
        </li>
        <li>
          <strong>Filtrar.</strong> Use “Tipos de conteúdo” e “Tópicos” acima das fileiras. Dentro de cada filtro vale qualquer opção marcada; entre os dois, as duas condições.
        </li>
        <li>
          <strong>Personalizar.</strong> Marque a estrela de um card para guardá-lo na sua tela e, em “Personalizar”, escolha as áreas, a ordem, o nome da tela e inclua links externos como cursos.
          Isso fica salvo só neste navegador.
        </li>
        <li>
          <strong>Voltar.</strong> Na tela de um serviço, o botão “Voltar” ou a tecla <kbd>Esc</kbd> retornam ao catálogo.
        </li>
      </ul>
      <div className="dialog__actions">
        <button type="button" className="btn btn--accent" onClick={onClose}>
          Entendi
        </button>
      </div>
    </Modal>
  );
}
