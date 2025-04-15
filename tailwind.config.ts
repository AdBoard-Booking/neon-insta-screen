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
				neon: {
					pink: '#FF00FF',
					purple: '#9b87f5',
					blue: '#33C3F0',
					darkPurple: '#1A1F2C'
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
				'glow': {
					'0%, 100%': {
						filter: 'brightness(1) drop-shadow(0 0 5px rgba(255, 0, 255, 0.7))'
					},
					'50%': {
						filter: 'brightness(1.2) drop-shadow(0 0 15px rgba(255, 0, 255, 0.9))'
					}
				},
				'sparkle': {
					'0%': {
						transform: 'scale(0) rotate(0deg)',
						opacity: '0'
					},
					'50%': {
						transform: 'scale(1) rotate(180deg)',
						opacity: '1'
					},
					'100%': {
						transform: 'scale(0) rotate(360deg)',
						opacity: '0'
					}
				},
				'flip': {
					'0%': {
						transform: 'rotateY(0deg)',
						opacity: '0'
					},
					'10%': {
						transform: 'rotateY(180deg)',
						opacity: '1'
					},
					'90%': {
						transform: 'rotateY(180deg)',
						opacity: '1'
					},
					'100%': {
						transform: 'rotateY(360deg)',
						opacity: '0'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				},
				'flash': {
					'0%, 100%': {
						opacity: '0'
					},
					'5%, 20%': {
						opacity: '1'
					}
				},
				'bubble-float': {
					'0%': {
						transform: 'translateY(100vh) scale(0)'
					},
					'100%': {
						transform: 'translateY(-20vh) scale(1.5)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'glow': 'glow 2s ease-in-out infinite',
				'sparkle': 'sparkle 3s ease-in-out infinite',
				'flip': 'flip 10s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite',
				'flash': 'flash 8s ease-in-out infinite',
				'bubble-float': 'bubble-float 15s linear infinite'
			},
			fontFamily: {
				'poppins': ['Poppins', 'sans-serif'],
				'montserrat': ['Montserrat', 'sans-serif']
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
