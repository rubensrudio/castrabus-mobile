import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Agendamento } from 'src/app/models/agendamento.model';
import { Animal } from 'src/app/models/animal.model';
import { HttpModel } from 'src/app/models/http.model';
import { AgendamentoService } from 'src/app/services/agendamento.service';
import { AnimalService } from 'src/app/services/animal.service';
import { AuthService } from 'src/app/services/auth.service';
import { CampanhaService } from 'src/app/services/campanha.service';
import { TipoEspecieService } from 'src/app/services/tipoEspecie.service';
import { TipoSexoService } from 'src/app/services/tipoSexo.service';

@Component({
  selector: 'app-agendamento-form',
  templateUrl: './agendamento-form.component.html',
  styleUrls: ['./agendamento-form.component.scss'],
})
export class AgendamentoFormComponent  implements OnInit {
  animalForm!: FormGroup;
  agendamentoForm!: FormGroup;
  sexos: any[] = [];
  especies: any[] = [];
  campanhas: any[] = [];
  pessoaId: number = 0;
  animais: Animal[] = [];
  user: any;
  httpModel: any;
  agendas: any[] = [];
  horarios: any[] = [];
  minDate!: Date;
  maxDate!: Date;
  animal!: Animal;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private animalService: AnimalService,
    private tipoEspecieService: TipoEspecieService,
    private tipoSexoService: TipoSexoService,
    private campanhaService: CampanhaService,
    private agendamentoService: AgendamentoService,
    private authService: AuthService,
    private mensagem: ToastrService
  ) {}

  ngOnInit() {
    this.getPessoaId();
    this.animalForm = this.fb.group({
      animalId: [''],
      nome: ['', [Validators.required, Validators.maxLength(50)]],
      ano: [''],
      meses: [''],
      peso: ['', Validators.required],
      chip: ['', Validators.maxLength(50)],
      raca: ['', Validators.maxLength(50)],
      sexoId: ['', Validators.required],
      especieId: ['', Validators.required],
      pessoaId: [0, Validators.required],
      pelagem: ['', Validators.required]
    });

    this.agendamentoForm = this.fb.group({
      campanhaId: ['', Validators.required],
      data: ['', Validators.required],
      horario: ['', Validators.required]
    });

    this.tipoSexoService.getTipoSexos().subscribe(data => {
      this.httpModel = data;
      this.sexos= this.httpModel.result;
    });

    this.tipoEspecieService.getTipoEspecies().subscribe(data => {
      this.httpModel = data;
      this.especies = this.httpModel.result;
    });

    this.campanhaService.getCampanhasValidas().subscribe((data) => {
      this.httpModel = data;
      this.campanhas = this.httpModel.result;
    });

    this.animalForm.get('animalId')?.valueChanges.subscribe((selectedAnimalId) => {
      if (selectedAnimalId) {
        this.disableAdditionalFields();
      } else {
        this.enableAdditionalFields();
      }
    });
  }

  async getPessoaId() {
    this.user = await this.authService.getUser();

    if(this.user?.id) {
      this.pessoaId = this.user.id;
    }

    this.animalService.getAnimaisByPessoaId(this.pessoaId).subscribe((data) => {
      this.animais = data;
    });
  }

  onSaveAgendamento() {
    if (this.agendamentoForm.valid) {
      if (this.pessoaId !== undefined) {
        let agendamentoData: any;
        if (this.animalForm.value.animalId > 0) {
          agendamentoData = {
            id: 0,
            campanhaId: this.agendamentoForm.value.campanhaId,
            data: this.convertDataBR(new Date(this.agendamentoForm.value.data)),
            hora: this.agendamentoForm.value.horario.horaInicio,
            pessoaId: this.pessoaId,
            animalId: this.animalForm.value.animalId,
            empresaId: this.user.empresa
          };
          this.onSubmitAgendamento(agendamentoData);
        }
        else {
          this.animalForm.patchValue({
            pessoaId: this.pessoaId
          });
          if (this.animalForm.valid) {
            this.animalService.createAnimal(this.animalForm.value).subscribe({
              next: (data: any) => {
                agendamentoData = {
                  id: 0,
                  campanhaId: this.agendamentoForm.value.campanhaId,
                  data: this.convertDataBR(new Date(this.agendamentoForm.value.data)),
                  hora: this.agendamentoForm.value.horario.horaInicio,
                  pessoaId: this.pessoaId,
                  animalId: data.result,
                  empresaId: this.user.empresa
                };
                this.onSubmitAgendamento(agendamentoData);
              },
              error: () => {
                this.mensagem.error('Erro ao salvar animal!', 'Erro');
              }
            });
          }
        }        
      }
      
    }
  }

  onSubmitAgendamento(agendamentoData: any) {
    this.agendamentoService.verificarAgendamento(agendamentoData.animalId, agendamentoData.campanhaId).subscribe(
      (agendado: boolean) => {
        if (agendado) {
          this.mensagem.warning('Este animal já tem agendamento registrado!', 'Aviso');
          console.log('animal já agendado!');
        } else {
          this.agendamentoService.createAgendamento(agendamentoData).subscribe({
            next: () => {
              this.mensagem.success('Agendamento Realizado com Sucesso!', 'Sucesso');
              this.navigateTo();
            },
            error: () => {
              this.mensagem.error('Erro ao realizar agendamento!', 'Erro');
            }
          });
        }
      },
      () => {
        this.mensagem.error('Erro ao verificar agendamento!', 'Erro');
      }
    );
  }

  navigateTo(): void {
    this.router.navigate(['/agendamentos']);
  }

  disableAdditionalFields() {
    this.animalForm.get('nome')?.disable();
    this.animalForm.get('ano')?.disable();
    this.animalForm.get('meses')?.disable();
    this.animalForm.get('peso')?.disable();
    this.animalForm.get('chip')?.disable();
    this.animalForm.get('raca')?.disable();
    this.animalForm.get('sexoId')?.disable();
    this.animalForm.get('especieId')?.disable();
    this.animalForm.get('pelagem')?.disable();
  }

  enableAdditionalFields() {
    this.animalForm.get('nome')?.enable();
    this.animalForm.get('ano')?.enable();
    this.animalForm.get('meses')?.enable();
    this.animalForm.get('peso')?.enable();
    this.animalForm.get('chip')?.enable();
    this.animalForm.get('raca')?.enable();
    this.animalForm.get('sexoId')?.enable();
    this.animalForm.get('especieId')?.enable();
    this.animalForm.get('pelagem')?.enable();
  }

  convertDataBR(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }

  onDateChange(event: MatDatepickerInputEvent<Date>) {
    const selectedDate = event.value;

    const formatDate = (date: Date): string => {
      return this.convertDataBR(date);
    };

    const agenda = this.agendas.find(a => a.data === formatDate(selectedDate!));

    if (agenda) {
        this.horarios = agenda.horarios.filter((h: { disponivel: any; }) => h.disponivel);
      } else {
        this.horarios = [];
      }
  }

  onCampanhaChange(event: MatSelectChange) {
    const campanhaId = event.value;
    this.agendamentoService.getAgendamentos(campanhaId).subscribe((data) => {
      this.agendas = data.agendas;

      const parseDate = (dateString: string): Date => {
        const [day, month, year] = dateString.split('/').map(Number);
        return new Date(year, month - 1, day);
      };

      this.minDate = parseDate(this.agendas[0].data);
      this.maxDate = parseDate(this.agendas[this.agendas.length - 1].data);
    });
  }

  onChangeAnimal(event: MatSelectChange) {
    const animalId = event.value;
    this.animalService.getAnimal(animalId).subscribe((data) => {
      this.animal = data;
    });
  }

}
