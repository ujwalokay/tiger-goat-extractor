import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Clock, RotateCcw, Swords } from "lucide-react";
import {
  createGame,
  legalMovesFrom,
  movePiece,
  placeGoat,
  tigerAiMove,
  TOTAL_GOATS,
  type GameState,
} from "@/lib/baghchal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const BoardScene = lazy(() => import("@/components/game/BoardScene"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bagh-Chal 3D — Tigers vs Goats Board Game" },
      {
        name: "description",
        content:
          "Play Bagh-Chal, the classic Nepalese tigers-and-goats strategy game, in a fully interactive 3D board rendered with Three.js.",
      },
      { property: "og:title", content: "Bagh-Chal 3D — Tigers vs Goats Board Game" },
      {
        property: "og:description",
        content: "Trap the tigers or devour the goats in this interactive 3D Bagh-Chal board game.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [game, setGame] = useState<GameState>(() => createGame());
  const [selected, setSelected] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [vsAi, setVsAi] = useState(true);

  useEffect(() => setMounted(true), []);

  const placementPhase = game.goatsPlaced < TOTAL_GOATS;

  const targets = useMemo(() => {
    if (game.winner) return [];
    if (selected !== null) return legalMovesFrom(game, selected);
    if (game.turn === "goat" && placementPhase)
      return game.board.map((c, i) => (c === "empty" ? i : -1)).filter((i) => i >= 0);
    return [];
  }, [game, selected, placementPhase]);

  const onNodeClick = useCallback(
    (i: number) => {
      if (game.winner) return;
      const cell = game.board[i];

      if (selected !== null) {
        const next = movePiece(game, selected, i);
        if (next) {
          setGame(next);
          setSelected(null);
          return;
        }
      }

      if (cell === game.turn && !(game.turn === "goat" && placementPhase)) {
        setSelected(selected === i ? null : i);
        return;
      }

      if (game.turn === "goat" && placementPhase && cell === "empty") {
        const next = placeGoat(game, i);
        if (next) {
          setGame(next);
          setSelected(null);
        }
      }
    },
    [game, selected, placementPhase],
  );

  // Tiger AI
  useEffect(() => {
    if (!vsAi || game.turn !== "tiger" || game.winner) return;
    const t = setTimeout(() => {
      setGame((g) => (g.turn === "tiger" && !g.winner ? (tigerAiMove(g) ?? g) : g));
    }, 600);
    return () => clearTimeout(t);
  }, [game, vsAi]);

  const reset = () => {
    setGame(createGame());
    setSelected(null);
  };

  const status = game.winner
    ? game.winner === "tiger"
      ? "Tigers win — five goats devoured!"
      : "Goats win — every tiger is trapped!"
    : game.turn === "goat"
      ? placementPhase
        ? "Goats: place a goat on any empty node"
        : "Goats: move a goat to an adjacent node"
      : vsAi
        ? "Tigers are prowling…"
        : "Tigers: move or jump over a goat";

  const tigersLeft = game.board.filter((c) => c === "tiger").length;
  const goatsOnBoard = game.board.filter((c) => c === "goat").length;
  const turnNo = String(game.history.length + 1).padStart(2, "0");

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-300">
      <div className="absolute inset-0">
        {mounted ? (
          <Suspense fallback={null}>
            <BoardScene
              board={game.board}
              selected={selected}
              targets={targets}
              onNodeClick={onNodeClick}
            />
          </Suspense>
        ) : null}
      </div>

      {/* HUD */}
      <div className="pointer-events-none relative z-10 flex min-h-screen flex-col justify-between p-3 sm:p-5">
        <header className="flex items-start justify-between gap-3">
          <IconButton label="Settings" onClick={() => setRulesOpen(true)}>
            <Settings className="size-5" />
          </IconButton>

          <div className="rounded-2xl border border-black/40 bg-neutral-900/85 px-6 py-2 text-xl font-black tracking-wide text-white shadow-2xl backdrop-blur sm:text-2xl">
            TURN <span className="text-amber-400">{turnNo}</span>
            <Users className="ml-2 inline size-5 -translate-y-0.5" />
          </div>

          <div className="flex gap-2">
            <IconButton label="Reset" onClick={reset}>
              <Undo2 className="size-5" />
            </IconButton>
            <IconButton label="Rules" onClick={() => setRulesOpen(true)}>
              <HelpCircle className="size-5" />
            </IconButton>
          </div>
        </header>

        <div className="flex items-center justify-between gap-3">
          <SidePanel
            side="tiger"
            title="TIGERS"
            emoji="🐯"
            value={`${tigersLeft} Tigers`}
            objective="Capture 5 Goats"
            active={game.turn === "tiger"}
          />
          <SidePanel
            side="goat"
            title="GOATS"
            emoji="🐐"
            value={`${goatsOnBoard} Goats`}
            objective="Survive or Trap Tigers"
            active={game.turn === "goat"}
          />
        </div>

        <footer className="flex flex-col items-center gap-3">
          <div
            className={`rounded-xl border-b-4 px-10 py-3 text-xl font-black tracking-wide text-white shadow-2xl sm:text-2xl ${
              game.winner
                ? "border-amber-800 bg-amber-500"
                : game.turn === "goat"
                  ? "border-lime-800 bg-lime-500"
                  : "border-orange-800 bg-orange-500"
            }`}
          >
            {game.winner
              ? game.winner === "tiger"
                ? "TIGERS WIN"
                : "GOATS WIN"
              : game.turn === "goat"
                ? "YOUR TURN"
                : "TIGERS MOVING…"}
          </div>
          <p className="rounded-full bg-black/40 px-4 py-1 text-xs font-semibold text-white backdrop-blur">
            {status}
          </p>

          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <div className="pointer-events-auto flex gap-2">
              <ActionButton icon={<BookOpen className="size-4" />} onClick={() => setRulesOpen(true)}>
                RULES
              </ActionButton>
              <ActionButton icon={<Clock className="size-4" />} onClick={() => setHistoryOpen(true)}>
                HISTORY
              </ActionButton>
            </div>
            <div className="pointer-events-auto flex gap-2">
              <ActionButton icon={<RotateCcw className="size-4" />} onClick={reset}>
                RESET
              </ActionButton>
              <ActionButton
                icon={<Swords className="size-4" />}
                onClick={() => {
                  setVsAi((v) => !v);
                  reset();
                }}
              >
                {vsAi ? "NEW GAME (2P)" : "NEW GAME (AI)"}
              </ActionButton>
            </div>
          </div>
        </footer>
      </div>

      <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How to play Bagh-Chal</DialogTitle>
            <DialogDescription>An ancient Nepalese hunt game of asymmetric war.</DialogDescription>
          </DialogHeader>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Four tigers start in the corners. Goats have 20 pieces to place.</li>
            <li>
              Phase 1: goats place one piece per turn on any empty node. Goats cannot move yet.
            </li>
            <li>Phase 2: once all 20 goats are placed, goats move along lines to adjacent nodes.</li>
            <li>
              Tigers move along lines, or jump straight over a single adjacent goat into the empty
              node beyond it to capture that goat.
            </li>
            <li>Tigers win by capturing 5 goats. Goats win by blocking every tiger move.</li>
          </ul>
        </DialogContent>
      </Dialog>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move history</DialogTitle>
            <DialogDescription>{game.history.length} moves played.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-72 pr-4">
            <ol className="space-y-1 text-sm">
              {game.history.length === 0 ? (
                <li className="text-muted-foreground">No moves yet.</li>
              ) : (
                game.history.map((h, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="w-6 shrink-0 text-muted-foreground">{i + 1}.</span>
                    <span>{h}</span>
                  </li>
                ))
              )}
            </ol>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="pointer-events-auto rounded-xl border border-black/40 bg-neutral-800/85 p-3 text-white shadow-xl backdrop-blur transition hover:bg-neutral-700"
    >
      {children}
    </button>
  );
}

function SidePanel({
  side,
  title,
  emoji,
  value,
  objective,
  active,
}: {
  side: "tiger" | "goat";
  title: string;
  emoji: string;
  value: string;
  objective: string;
  active: boolean;
}) {
  return (
    <div
      className={`w-40 overflow-hidden rounded-2xl border border-black/40 bg-neutral-800/85 shadow-2xl backdrop-blur transition sm:w-52 ${
        active ? "ring-2 ring-amber-300" : ""
      }`}
    >
      <div
        className={`flex items-center gap-2 px-3 py-2 ${
          side === "tiger" ? "bg-orange-900/90" : "bg-blue-900/90"
        }`}
      >
        <span className="text-2xl leading-none">{emoji}</span>
        <span className="text-lg font-black tracking-wide text-white sm:text-xl">{title}</span>
      </div>
      <div className="px-3 py-2 text-center text-base font-bold text-white sm:text-lg">{value}</div>
      <div className="mx-3 border-t border-white/20" />
      <div className="px-3 py-2 text-xs text-white/90 sm:text-sm">
        <span className="font-bold">Objective:</span>
        <br />
        {objective}
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  children,
  onClick,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      className="gap-2 rounded-xl border-b-4 border-neutral-400 bg-neutral-200 font-black tracking-wide text-neutral-900 shadow-xl hover:bg-white"
      variant="secondary"
    >
      {icon}
      {children}
    </Button>
  );
}

