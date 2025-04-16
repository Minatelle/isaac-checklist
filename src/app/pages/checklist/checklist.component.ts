import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import checklistData from './checklist-data.json';

@Component({
  selector: 'app-checklist',
  imports: [NgFor, NgIf],
  templateUrl: './checklist.component.html',
  styleUrl: './checklist.component.scss'
})
export class ChecklistComponent {
  public characters = checklistData.characters;
  public achievements = checklistData.achievements;

  public getExtraCells(achievementsLength: number): number {
    return this.characters.length - achievementsLength;
  }
}
