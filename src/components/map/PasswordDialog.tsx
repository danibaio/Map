import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (pwd: string) => void;
  title?: string;
};

export default function PasswordDialog({
  open,
  onOpenChange,
  onSubmit,
  title = "🗝 Modo edición",
}: Props) {
  const [pwd, setPwd] = useState("");

  useEffect(() => {
    if (open) setPwd("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[1100] max-w-sm border-2 border-[#7a1414] bg-black text-[#e8dfd0] shadow-[0_0_30px_rgba(184,26,26,0.5)]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl uppercase tracking-widest text-[#e8dfd0]">
            {title}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(pwd);
          }}
          className="space-y-3"
        >
          <Label htmlFor="pwd" className="uppercase tracking-wider text-[#b81a1a]">
            Introduce la contraseña
          </Label>
          <Input
            id="pwd"
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="border-[#7a1414] bg-[#0a0a0a] text-[#e8dfd0] focus-visible:ring-[#b81a1a]"
            autoFocus
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-2 border-[#3a1414] bg-transparent text-[#e8dfd0] hover:bg-[#2a0a0a] hover:text-[#e8dfd0]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#b81a1a] font-bold uppercase tracking-wider text-[#e8dfd0] hover:bg-[#d42020]"
            >
              Entrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
