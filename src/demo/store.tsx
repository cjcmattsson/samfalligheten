import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  initialAssemblyDate,
  initialAssociation,
  initialBoard,
  initialDocs,
  initialFolders,
  initialMailings,
  initialMembers,
  initialNews,
  initialPages,
  initialSteps,
  initialTasks,
  type Association,
  type AssemblyStep,
  type BoardMember,
  type Doc,
  type Folder,
  type Mailing,
  type Member,
  type NewsItem,
  type Page,
  type YearTask,
} from "./data";

export type Palette = "fjord" | "skog" | "falu";

type Setter<T> = Dispatch<SetStateAction<T>>;

type Store = {
  association: Association;
  setAssociation: Setter<Association>;
  news: NewsItem[];
  setNews: Setter<NewsItem[]>;
  members: Member[];
  setMembers: Setter<Member[]>;
  mailings: Mailing[];
  setMailings: Setter<Mailing[]>;
  folders: Folder[];
  setFolders: Setter<Folder[]>;
  docs: Doc[];
  setDocs: Setter<Doc[]>;
  pages: Page[];
  setPages: Setter<Page[]>;
  tasks: YearTask[];
  setTasks: Setter<YearTask[]>;
  steps: AssemblyStep[];
  setSteps: Setter<AssemblyStep[]>;
  board: BoardMember[];
  setBoard: Setter<BoardMember[]>;
  assemblyDate: string;
  setAssemblyDate: Setter<string>;
  palette: Palette;
  setPalette: Setter<Palette>;
  toast: (message: string) => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [association, setAssociation] = useState(initialAssociation);
  const [news, setNews] = useState(initialNews);
  const [members, setMembers] = useState(initialMembers);
  const [mailings, setMailings] = useState(initialMailings);
  const [folders, setFolders] = useState(initialFolders);
  const [docs, setDocs] = useState(initialDocs);
  const [pages, setPages] = useState(initialPages);
  const [tasks, setTasks] = useState(initialTasks);
  const [steps, setSteps] = useState(initialSteps);
  const [board, setBoard] = useState(initialBoard);
  const [assemblyDate, setAssemblyDate] = useState(initialAssemblyDate);
  const [palette, setPalette] = useState<Palette>("fjord");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dataset.palette = palette;
  }, [palette]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <StoreContext.Provider
      value={{
        association,
        setAssociation,
        news,
        setNews,
        members,
        setMembers,
        mailings,
        setMailings,
        folders,
        setFolders,
        docs,
        setDocs,
        pages,
        setPages,
        tasks,
        setTasks,
        steps,
        setSteps,
        board,
        setBoard,
        assemblyDate,
        setAssemblyDate,
        palette,
        setPalette,
        toast: setMessage,
      }}
    >
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
        {message && (
          <p className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas shadow-lg">
            {message}
          </p>
        )}
      </div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside StoreProvider");
  return store;
}
