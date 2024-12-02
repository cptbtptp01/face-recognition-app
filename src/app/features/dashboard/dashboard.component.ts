import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FeedComponent } from './components/webcam/feed.component';
import { Store } from '@ngrx/store';

/**
 * Entry point for the app
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FeedComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  constructor(private store: Store) {}
}
