import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { inject } from '@vercel/analytics';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    inject();
  }
}
