import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Important for *ngIf, etc.
import { AuthService } from '../../../core/auth/auth.service';
import { DialogService } from '../../../core/services/dialog.service';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private dialogService = inject(DialogService);

    loginForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(4)]] // Minimum length for security?
    });

    loginStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
    errorMessage: string | null = null;
    statusMessage: string = '';

    onSubmit() {
        if (this.loginForm.invalid) {
            return;
        }

        this.loginStatus = 'loading';
        this.statusMessage = 'Autenticando...';
        const { email, password } = this.loginForm.value;

        this.authService.login(email, password).subscribe({
            next: () => {
                this.loginStatus = 'success';
                this.statusMessage = 'Login realizado com sucesso!';
                // Short delay to show success state before navigation
                setTimeout(() => {
                    this.router.navigate(['/dashboard']);
                }, 1500);
            },
            error: (err) => {
                this.loginStatus = 'error';
                this.statusMessage = 'Erro ao realizar login.';
                this.errorMessage = 'Verifique suas credenciais e tente novamente.';
                console.error('Login error', err);
            }
        });
    }

    closeOverlay() {
        this.loginStatus = 'idle';
        this.errorMessage = null; 
    }
    showNotImplemented(event: Event) {
        event.preventDefault();
        this.dialogService.alert('Aviso', 'Recurso não implementado');
    }
}
