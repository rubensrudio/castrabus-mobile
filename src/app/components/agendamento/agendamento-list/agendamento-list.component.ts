import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Agendamento } from 'src/app/models/agendamento.model';
import { AgendamentoService } from 'src/app/services/agendamento.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-agendamento-list',
  templateUrl: './agendamento-list.component.html',
  styleUrls: ['./agendamento-list.component.scss'],
})
export class AgendamentoListComponent  implements OnInit {
  agendamentos: Agendamento[] = [];
  displayedColumns: string[] = ['campanhaId', 'data', 'hora', 'animalId', 'actions'];
  httpModel: any;
  user: any;

  expandedStates = new Map<number, boolean>();

  constructor(
    private agendamentoService: AgendamentoService,
    private router: Router,
    private auth: AuthService,
    private mensagem: ToastrService
  ) { }

  async ngOnInit() {
    this.user = await this.auth.getUser();
    this.loadAgendamento();
  }

  loadAgendamento() {
      let userId = 0;

      if(this.user?.id) {
        userId = this.user.id;
      }
      console.log(userId);
      this.agendamentoService.getAllMyAgendamentos(userId).subscribe((data) => {
        this.httpModel = data;
        this.agendamentos = data;
        console.log(this.agendamentos);
      });
  }

  deleteAgendamento(id: number): void {
    this.agendamentoService.deleteAgendamento(id).subscribe({
      next: () => {
        this.mensagem.success('Agendamento Realizado com Sucesso!', 'Sucesso');
        this.agendamentos = this.agendamentos.filter(u => u.id !== id);
        this.loadAgendamento();
      },
      error: () => {
        this.mensagem.error('Erro ao realizar agendamento!', 'Erro');
      }
    });
  }

  podeExcluir(data: string, hora: string): boolean {
    const [dia, mes, ano] = data.split('/').map(Number);
    const [horas, minutos] = hora.split(':').map(Number);

    const dataRecebida = new Date(ano, mes - 1, dia, horas, minutos);

    const dataAtual = new Date();

    return dataRecebida > dataAtual;
  }

  toggleExpand(agendamentoId: number) {
    const isExpanded = this.expandedStates.get(agendamentoId) || false;
    this.expandedStates.set(agendamentoId, !isExpanded);
  }

  isExpanded(agendamentoId: number): boolean {
    return this.expandedStates.get(agendamentoId) || false;
  }

  convertDataBR(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
