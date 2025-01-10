import { useState, useRef } from 'react';
import { Upload, Download, Plus, Trash2, Settings } from 'lucide-react';
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

interface CompanyData {
  name: string;
  cnpj: string;
  address: string;
}

interface TotalData {
  totalReceivable: string;
  totalPayable: string;
  balance: string;
}

interface AccountEntry {
  date: string;
  description: string;
  value: string;
  status: string;
}

interface AccountData {
  payable: AccountEntry[];
  receivable: AccountEntry[];
}

export default function ContasSemanais() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backgroundSvg, setBackgroundSvg] = useState<string | null>(null);
  const [showPositionConfig, setShowPositionConfig] = useState(false);
  
  // Data state
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    cnpj: '',
    address: ''
  });
  
  const [totalData, setTotalData] = useState<TotalData>({
    totalReceivable: '',
    totalPayable: '',
    balance: ''
  });
  
  const [accountData, setAccountData] = useState<AccountData>({
    payable: Array(5).fill({ date: '', description: '', value: '', status: '' }),
    receivable: Array(5).fill({ date: '', description: '', value: '', status: '' })
  });

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
      };
      reader.readAsDataURL(file);
    }
  };

  const updateAccountEntry = (
    type: 'payable' | 'receivable',
    index: number,
    field: keyof AccountEntry,
    value: string
  ) => {
    setAccountData(prev => ({
      ...prev,
      [type]: prev[type].map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const generatePDF = () => {
    toast({
      title: "Gerando PDF",
      description: "Função em desenvolvimento...",
    });
  };

  return (
    <div className="space-y-6">
      {/* Background Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Plano de Fundo</CardTitle>
          <CardDescription>
            Faça upload de uma imagem SVG para usar como plano de fundo do relatório
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
              <span className="text-sm text-muted-foreground">
                SVG carregado com sucesso
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Company Data Section */}
      <Card>
        <CardHeader>
          <CardTitle>Dados da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Nome da Empresa</Label>
              <Input
                value={companyData.name}
                onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Razão Social"
              />
            </div>
            <div>
              <Label>CNPJ</Label>
              <Input
                value={companyData.cnpj}
                onChange={(e) => setCompanyData(prev => ({ ...prev, cnpj: e.target.value }))}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div>
              <Label>Endereço</Label>
              <Input
                value={companyData.address}
                onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Endereço completo"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Data Section */}
      <Card>
        <CardHeader>
          <CardTitle>Totais Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Total a Receber</Label>
              <Input
                value={totalData.totalReceivable}
                onChange={(e) => setTotalData(prev => ({ ...prev, totalReceivable: e.target.value }))}
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <Label>Total a Pagar</Label>
              <Input
                value={totalData.totalPayable}
                onChange={(e) => setTotalData(prev => ({ ...prev, totalPayable: e.target.value }))}
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <Label>Saldo</Label>
              <Input
                value={totalData.balance}
                onChange={(e) => setTotalData(prev => ({ ...prev, balance: e.target.value }))}
                placeholder="R$ 0,00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Tables */}
      <div className="grid grid-cols-2 gap-6">
        {/* Accounts Payable */}
        <Card>
          <CardHeader>
            <CardTitle>Contas a Pagar</CardTitle>
          </CardHeader>
          <CardContent>
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
                {accountData.payable.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        type="date"
                        value={entry.date}
                        onChange={(e) => updateAccountEntry('payable', index, 'date', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={entry.description}
                        onChange={(e) => updateAccountEntry('payable', index, 'description', e.target.value)}
                        placeholder="Descrição"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={entry.value}
                        onChange={(e) => updateAccountEntry('payable', index, 'value', e.target.value)}
                        placeholder="R$ 0,00"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={entry.status}
                        onChange={(e) => updateAccountEntry('payable', index, 'status', e.target.value)}
                        placeholder="Status"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Accounts Receivable */}
        <Card>
          <CardHeader>
            <CardTitle>Contas a Receber</CardTitle>
          </CardHeader>
          <CardContent>
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
                {accountData.receivable.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        type="date"
                        value={entry.date}
                        onChange={(e) => updateAccountEntry('receivable', index, 'date', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={entry.description}
                        onChange={(e) => updateAccountEntry('receivable', index, 'description', e.target.value)}
                        placeholder="Descrição"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={entry.value}
                        onChange={(e) => updateAccountEntry('receivable', index, 'value', e.target.value)}
                        placeholder="R$ 0,00"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={entry.status}
                        onChange={(e) => updateAccountEntry('receivable', index, 'status', e.target.value)}
                        placeholder="Status"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => setShowPositionConfig(true)}
          disabled={!backgroundSvg}
        >
          <Settings className="h-4 w-4 mr-2" />
          Configurar Posições
        </Button>
        <Button
          onClick={generatePDF}
          disabled={!backgroundSvg}
        >
          <Download className="h-4 w-4 mr-2" />
          Gerar PDF
        </Button>
      </div>

      {/* Preview Section */}
      {backgroundSvg && (
        <Card>
          <CardHeader>
            <CardTitle>Visualização do Relatório</CardTitle>
            <CardDescription>
              Prévia do relatório em tamanho real (1920x1080)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div 
                className="w-[1920px] h-[1080px] origin-top-left"
                style={{ 
                  transform: 'scale(0.5)',
                  backgroundImage: `url(${backgroundSvg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {/* Preview content will be rendered here */}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Position Configuration Dialog */}
      <Dialog open={showPositionConfig} onOpenChange={setShowPositionConfig}>
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle>Configurar Posições das Variáveis</DialogTitle>
          </DialogHeader>
          <div className="w-full overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div 
              className="w-[1920px] h-[1080px] origin-top-left relative"
              style={{ 
                transform: 'scale(0.4)',
                backgroundImage: `url(${backgroundSvg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Draggable variables will be rendered here */}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPositionConfig(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowPositionConfig(false)}>
              Salvar Posições
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}