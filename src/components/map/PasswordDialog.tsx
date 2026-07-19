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
};

export default function PasswordDialog({ open, onOpenChange, onSubmit }: Props) {
  const [pwd, setPwd] = useState("");

  useEffect(() => {
    if (open) setPwd("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[1100] max-w-sm border-2 border-[#7a5c2e] bg-[#2b1e12] text-[#f2d9a4]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">🗝 Modo edición</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(pwd);
          }}
          className="space-y-3"
        >
          <Label htmlFor="pwd" className="text-[#e0c893]">
            Introduce la contraseña
          </Label>
          <Input
            id="pwd"
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="border-[#7a5c2e] bg-[#1f150c] text-[#f2d9a4]"
            autoFocus
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#7a5c2e] bg-transparent text-[#f2d9a4] hover:bg-[#3d2a19] hover:text-[#f2d9a4]"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#c9a96a] text-[#1a1410] hover:bg-[#d4b878]">
              Entrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
