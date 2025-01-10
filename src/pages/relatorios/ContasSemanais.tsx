import { useState, useRef } from 'react';
import { Upload, Download, Plus, Trash2, Settings, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Draggable from 'react-draggable';
import jsPDF from 'jspdf';

interface CompanyData {
  name: string;
  ownerName: string;
  cnpj: string;
}

interface FinancialData {
  totalPayable: number;
  totalReceivable: number;
  balance: number;
}

interface PaymentEntry {
  date: string;
  description: string;
  value: number;
  status: 'pending' | 'paid' | 'overdue';
}

export default function ContasSemanais() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backgroundSvg, setBackgroundSvg] = useState<string | null>(null);
  const [showPositionConfig, setShowPositionConfig] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Company and Financial Data state
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    ownerName: '',
    cnpj: ''
  });

  const [financialData, setFinancialData] = useState<FinancialData>({
    totalPayable: 0,
    totalReceivable: 0,
    balance: 0
  });

  // Payment entries state
  const [payableEntries, setPayableEntries] = useState<PaymentEntry[]>([]);
  const [receivableEntries, setReceivableEntries] = useState<PaymentEntry[]>([]);

  const handleAddPayableEntry = () => {
    const newEntry: PaymentEntry = {
      date: '',
      description: '',
      value: 0,
      status: 'pending'
    };
    setPayableEntries([...payableEntries, newEntry]);
  };

  const handleAddReceivableEntry = () => {
    const newEntry: PaymentEntry = {
      date: '',
      description: '',
      value: 0,
      status: 'pending'
    };
    setReceivableEntries([...receivableEntries, newEntry]);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'image/svg+xml') {
        toast({
          title: "Erro no upload",
          description: "Por favor, selecione um arquivo SVG válido.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundSvg(e.target?.result as string);
        toast({
          title: "SVG carregado",
          description: "O arquivo SVG foi carregado com sucesso.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Company Data Section */}
      <Card>
        <CardHeader>
          <CardTitle>Dados da Empresa</CardTitle>
          <CardDescription>
            Informações básicas da empresa para o relatório
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Nome da Empresa</Label>
            <Input
              value={companyData.name}
              onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
              placeholder="Razão Social"
            />
          </div>
          <div className="space-y-2">
            <Label>Nome do Sócio</Label>
            <Input
              value={companyData.ownerName}
              onChange={(e) => setCompanyData({ ...companyData, ownerName: e.target.value })}
              placeholder="Nome completo"
            />
          </div>
          <div className="space-y-2">
            <Label>CNPJ</Label>
            <Input
              value={companyData.cnpj}
              onChange={(e) => setCompanyData({ ...companyData, cnpj: e.target.value })}
              placeholder="00.000.000/0000-00"
            />
          </div>
        </CardContent>
      </Card>

      {/* Financial Totals Section */}
      <Card>
        <CardHeader>
          <CardTitle>Totais Financeiros</CardTitle>
          <CardDescription>
            Resumo dos valores a pagar, receber e saldo
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Total a Pagar</Label>
            <Input
              type="number"
              value={financialData.totalPayable}
              onChange={(e) => setFinancialData({ 
                ...financialData, 
                totalPayable: Number(e.target.value),
                balance: Number(e.target.value) - financialData.totalReceivable
              })}
              className="text-red-500 font-medium"
            />
          </div>
          <div className="space-y-2">
            <Label>Total a Receber</Label>
            <Input
              type="number"
              value={financialData.totalReceivable}
              onChange={(e) => setFinancialData({ 
                ...financialData, 
                totalReceivable: Number(e.target.value),
                balance: financialData.totalPayable - Number(e.target.value)
              })}
              className="text-green-500 font-medium"
            />
          </div>
          <div className="space-y-2">
            <Label>Saldo Total</Label>
            <Input
              value={formatCurrency(financialData.balance)}
              readOnly
              className={`font-medium ${financialData.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Accounts Tables Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Payable Accounts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contas a Pagar</CardTitle>
              <Button onClick={handleAddPayableEntry}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payableEntries.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          type="date"
                          value={entry.date}
                          onChange={(e) => {
                            const newEntries = [...payableEntries];
                            newEntries[index].date = e.target.value;
                            setPayableEntries(newEntries);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry.description}
                          onChange={(e) => {
                            const newEntries = [...payableEntries];
                            newEntries[index].description = e.target.value;
                            setPayableEntries(newEntries);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={entry.value}
                          onChange={(e) => {
                            const newEntries = [...payableEntries];
                            newEntries[index].value = Number(e.target.value);
                            setPayableEntries(newEntries);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <select
                          className="w-full rounded-md border border-input bg-background px-3 py-1"
                          value={entry.status}
                          onChange={(e) => {
                            const newEntries = [...payableEntries];
                            newEntries[index].status = e.target.value as PaymentEntry['status'];
                            setPayableEntries(newEntries);
                          }}
                        >
                          <option value="pending">Pendente</option>
                          <option value="paid">Pago</option>
                          <option value="overdue">Atrasado</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Receivable Accounts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contas a Receber</CardTitle>
              <Button onClick={handleAddReceivableEntry}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivableEntries.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          type="date"
                          value={entry.date}
                          onChange={(e) => {
                            const newEntries = [...receivableEntries];
                            newEntries[index].date = e.target.value;
                            setReceivableEntries(newEntries);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry.description}
                          onChange={(e) => {
                            const newEntries = [...receivableEntries];
                            newEntries[index].description = e.target.value;
                            setReceivableEntries(newEntries);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={entry.value}
                          onChange={(e) => {
                            const newEntries = [...receivableEntries];
                            newEntries[index].value = Number(e.target.value);
                            setReceivableEntries(newEntries);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <select
                          className="w-full rounded-md border border-input bg-background px-3 py-1"
                          value={entry.status}
                          onChange={(e) => {
                            const newEntries = [...receivableEntries];
                            newEntries[index].status = e.target.value as PaymentEntry['status'];
                            setReceivableEntries(newEntries);
                          }}
                        >
                          <option value="pending">Pendente</option>
                          <option value="paid">Recebido</option>
                          <option value="overdue">Atrasado</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Background Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Plano de Fundo</CardTitle>
          <CardDescription>
            Faça upload de uma imagem SVG para usar como plano de fundo do relatório (2480x3508 px)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              accept=".svg"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload SVG
            </Button>
            {backgroundSvg && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  SVG carregado com sucesso
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle>Visualização do SVG</DialogTitle>
          </DialogHeader>
          <div className="w-full overflow-auto max-h-[80vh]">
            {backgroundSvg && (
              <img
                src={backgroundSvg}
                alt="Preview do SVG"
                className="w-full h-auto"
              />
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPreview(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Display SVG at the bottom if loaded */}
      {backgroundSvg && (
        <Card>
          <CardHeader>
            <CardTitle>SVG Carregado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-hidden rounded-lg border">
              <img
                src={backgroundSvg}
                alt="SVG carregado"
                className="w-full h-auto"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}