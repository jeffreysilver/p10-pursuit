import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Racing themed colors
				f1: {
					red: '#FF2800',
					black: '#15151E',
					gray: '#38383F',
					yellow: '#FFDA0A',
					blue: '#0090D0',
					white: '#FFFFFF',
					gulf: '#B9E0F7',
					papaya: '#FF8000',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'bounce-subtle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'race-flag': {
					'0%': { transform: 'translateY(0) rotate(-5deg)' },
					'50%': { transform: 'translateY(0) rotate(5deg)' },
					'100%': { transform: 'translateY(0) rotate(-5deg)' }
				},
				'checkered-slide': {
					'0%': { backgroundPosition: '0 0' },
					'100%': { backgroundPosition: '20px 20px' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'bounce-subtle': 'bounce-subtle 2s infinite ease-in-out',
				'race-flag': 'race-flag 3s infinite ease-in-out',
				'checkered-slide': 'checkered-slide 1s linear infinite'
			},
			backgroundImage: {
				'checkered-pattern': 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 20px 20px',
				'checkered-pattern-sm': 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 10px 10px',
				'checkered-border': 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 5px 5px',
			}
		}
	},
	plugins: [require("tailwindcss-animate")], // eslint-disable-line
} satisfies Config;
