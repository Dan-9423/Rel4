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
import Draggable from 'react-draggable';
import jsPDF from 'jspdf';

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

interface VariablePosition {
  id: string;
  label: string;
  x: number;
  y: number;
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

  // Variable positions state
  const [variablePositions, setVariablePositions] = useState<VariablePosition[]>([
    { id: 'company-name', label: 'Nome da Empresa', x: 0, y: 0 },
    { id: 'cnpj', label: 'CNPJ', x: 0, y: 50 },
    { id: 'address', label: 'Endereço', x: 0, y: 100 },
    { id: 'total-receivable', label: 'Total a Receber', x: 0, y: 150 },
    { id: 'total-payable', label: 'Total a Pagar', x: 0, y: 200 },
    { id: 'balance', label: 'Saldo', x: 0, y: 250 },
  ]);

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

  const handleDragStop = (id: string, e: any, data: { x: number; y: number }) => {
    setVariablePositions(prev => prev.map(pos => 
      pos.id === id ? { ...pos, x: data.x, y: data.y } : pos
    ));
  };

  const generatePDF = () => {
    try {
      // Create new PDF document
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1920, 1080]
      });

      // Add background if exists
      if (backgroundSvg) {
        pdf.addImage(backgroundSvg, 'SVG', 0, 0, 1920, 1080);
      }

      // Add variables in their positions
      variablePositions.forEach(variable => {
        let value = '';
        switch (variable.id) {
          case 'company-name':
            value = companyData.name;
            break;
          case 'cnpj':
            value = companyData.cnpj;
            break;
          case 'address':
            value = companyData.address;
            break;
          case 'total-receivable':
            value = totalData.totalReceivable;
            break;
          case 'total-payable':
            value = totalData.totalPayable;
            break;
          case 'balance':
            value = totalData.balance;
            break;
        }
        pdf.text(value, variable.x, variable.y);
      });

      // Save the PDF
      pdf.save('relatorio-semanal.pdf');

      toast({
        title: "PDF Gerado",
        description: "O relatório foi gerado e baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o relatório.",
        variant: "destructive",
      });
    }
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
                        onChange={(e) => {
                          const newPayable = [...accountData.payable];
                          newPayable[index] = { ...entry, date: e.target.value };
                          setAccountData({ ...accountData, payable: newPayable });
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={entry.description}
                        onChange={(e) => {
                          const newPayable = [...accountData.payable];
                          newPayable[index] = { ...entry, description: e.target.value };
                          setAccountData({ ...accountData, payable: newPayable });
                        }}
                        placeholder="Descrição"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={entry.value}
                        onChange={(e) => {
                          const newPayable = [...accountData.payable];
                          newPayable[index] = { ...entry, value: e.target.value };
                          setAccountData({ ...accountData, payable: newPayable });
                        }}
                        placeholder="R$ 0,00"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={entry.status}
                        onChange={(e) => {
                          const newPayable = [...accountData.payable];
                          newPayable[index] = { ...entry, status: e.target.value };
                          setAccountData({ ...accountData, payable: newPayable });
                        }}
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
                        onChange={(e) => {
                          const newReceivable = [...accountData.receivable];
                          newReceivable[index] = { ...entry, date: e.target.value };
                          setAccountData({ ...accountData, receivable: newReceivable });
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={entry.description}
                        onChange={(e) => {
                          const newReceivable = [...accountData.receivable];
                          newReceivable[index] = { ...entry, description: e.target.value };
                          setAccountData({ ...accountData, receivable: newReceivable });
                        }}
                        placeholder="Descrição"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={entry.value}
                        onChange={(e) => {
                          const newReceivable = [...accountData.receivable];
                          newReceivable[index] = { ...entry, value: e.target.value };
                          setAccountData({ ...accountData, receivable: newReceivable });
                        }}
                        placeholder="R$ 0,00"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={entry.status}
                        onChange={(e) => {
                          const newReceivable = [...accountData.receivable];
                          newReceivable[index] = { ...entry, status: e.target.value };
                          setAccountData({ ...accountData, receivable: newReceivable });
                        }}
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
              {variablePositions.map((variable) => (
                <Draggable
                  key={variable.id}
                  position={{ x: variable.x, y: variable.y }}
                  onStop={(e, data) => handleDragStop(variable.id, e, data)}
                  bounds="parent"
                >
                  <div className="absolute cursor-move bg-white dark:bg-gray-800 p-2 rounded shadow-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium">{variable.label}</span>
                  </div>
                </Draggable>
              ))}
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