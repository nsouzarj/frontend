import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        MatSidenavModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule,
        MatButtonModule
    ],
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
    private authService = inject(AuthService);
    public user = this.authService.currentUser;
    private breakpointObserver = inject(BreakpointObserver);

    private cdr = inject(ChangeDetectorRef);

    isSidebarOpen = true;
    isMobile = false;
    sidenavMode: 'side' | 'over' = 'side';

    ngOnInit() {
        this.breakpointObserver.observe([Breakpoints.Handset])
            .subscribe(result => {
                this.isMobile = result.matches;
                if (this.isMobile) {
                    this.sidenavMode = 'over';
                    this.isSidebarOpen = false;
                } else {
                    this.sidenavMode = 'side';
                    this.isSidebarOpen = true;
                }
                // Removed cdr.detectChanges() to fix Assertion Error
            });
    }

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    logout() {
        this.authService.logout();
    }

    closeSidebarOnMobile() {
        if (this.isMobile) {
            this.isSidebarOpen = false;
        }
    }
}
