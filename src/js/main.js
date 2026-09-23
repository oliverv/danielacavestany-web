/**
 * main.js — entry point for all pages.
 * Imports: CSS (processed by Vite), nav behaviour, gallery.
 * Page-specific modules imported conditionally by page identifier.
 */
import '../css/main.css';
import './nav.js';
import './gallery.js';

// Portrait scroll scale — only on pages that have the stage-full portrait
import { initPortraitScale } from './portrait.js';
initPortraitScale();

// Contact form — only on contacto pages
if (document.getElementById('contact-form')) {
  import('./contact.js');
}
