import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './components/sidebar/sidebar.component';
import { Breadcrumb } from './components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Breadcrumb],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class App {}
