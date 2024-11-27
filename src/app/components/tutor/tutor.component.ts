import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TipoSexo } from 'src/app/models/tipoSexo.model';
import { IbgeService } from 'src/app/services/ibge.service';
import { PessoaService } from 'src/app/services/pessoa.service';
import { TipoSexoService } from 'src/app/services/tipoSexo.service';
import * as crypto from 'crypto-js';

const TUTOR_TIPO_PESSOA_ID = 1;

@Component({
  selector: 'app-tutor',
  templateUrl: './tutor.component.html',
  styleUrls: ['./tutor.component.scss'],
})
export class TutorComponent  implements OnInit {
  pessoaForm!: FormGroup;
  tipoSexo!: TipoSexo[];
  httpModel!: any;
  estados: any[] = [];
  cidades: any[] = [];
  bairros: any[] = [];

  constructor(
    private fb: FormBuilder,
    private pessoaService: PessoaService,
    private router: Router,
    private tipoSexoService: TipoSexoService,
    private ibgeService: IbgeService
  ) { 
    this.pessoaForm = this.fb.group({
      nomeCompleto: ['', [Validators.required, Validators.maxLength(255)]],
      dataNascimento: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.maxLength(14)]],
      identidade: ['', [Validators.required, Validators.maxLength(30)]],
      telefone: ['', [Validators.required, Validators.maxLength(30)]],
      endereco: ['', [Validators.required, Validators.maxLength(4000)]],
      estadoId: ['', Validators.required],
      cidadeId: ['', Validators.required],
      bairroId: ['', Validators.required],
      cep: ['', [Validators.required, Validators.maxLength(9)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      usuarioId: [0],
      sexoId: ['', Validators.required],
      tipoPessoaId: [TUTOR_TIPO_PESSOA_ID],
      senha: ['', [Validators.maxLength(100), this.senhaRequiredIfUsuarioIdZero()]]
    });
  }

  ngOnInit() {
    this.loadEstados();
    this.tipoSexoService.getTipoSexos().subscribe(dado => {
      this.httpModel = dado;
      this.tipoSexo = this.httpModel.result;
    });
    
  }

  loadEstados() {
    this.ibgeService.getEstados().subscribe((data) => {
      this.estados = data;
    });
  }
  
  onEstadoChange() {
    const estadoId = this.pessoaForm.get('estadoId')?.value;
    this.ibgeService.getCidadesByEstadoId(estadoId).subscribe((data) => {
      this.cidades = data;
    });
  }
  
  onCidadeChange() {
    const cidadeId = this.pessoaForm.get('cidadeId')?.value;
    this.ibgeService.getBairrosByCidadeId(cidadeId).subscribe((data) => {
      this.bairros = data;
    });
  }

  senhaRequiredIfUsuarioIdZero() {
    return (control: any) => {
      if (this.pessoaForm && this.pessoaForm.get('usuarioId')?.value === 0 && !control.value) {
        return { required: true };
      }
      return null;
    };
  }

  onSubmit(): void {
    if (this.pessoaForm.valid) {
      this.pessoaForm.patchValue({
        senha: crypto.SHA256(this.pessoaForm.get('senha')?.value).toString()
      })
      const pessoaData = this.pessoaForm.value;
      this.pessoaService.createPessoa(pessoaData).subscribe(() => {
        this.navigateTo();
      });
    }
  }

  navigateTo(): void {
    this.router.navigate(['/home']);
  }

}
