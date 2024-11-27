import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomePage } from './components/home/home.page';
import { TutorComponent } from './components/tutor/tutor.component';
import { LoginComponent } from './components/login/login.component';
import { AgendamentoListComponent } from './components/agendamento/agendamento-list/agendamento-list.component';
import { AgendamentoFormComponent } from './components/agendamento/agendamento-form/agendamento-form.component';

const routes: Routes = [
  { path: 'home', component: HomePage },
  { path: 'tutor/create', component: TutorComponent },
  { path: 'login', component: LoginComponent },
  { path: 'agendamentos', component: AgendamentoListComponent },
  { path: 'agendamento/create', component: AgendamentoFormComponent },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
