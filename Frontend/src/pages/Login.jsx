import { useState } from 'react'

function Login() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState('')

	const handleSubmit = async (event) => {
		event.preventDefault()
		setError('')
		setIsSubmitting(true)

		try {
			const res = await fetch('/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ email, password })
			})

			const data = await res.json()

			if (!res.ok) {
				throw new Error(data?.message || 'Login failed')
			}

			console.log('Login success', data)
		} catch (err) {
			setError(err.message || 'Login failed')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="login-shell">
			<div className="login-card">
				<header className="login-header">
					<p className="eyebrow">Welcome back</p>
					<h1>Sign in</h1>
					<p className="muted">Enter your email and password to continue.</p>
				</header>

				<form className="login-form" onSubmit={handleSubmit}>
					<label className="field">
						<span>Email</span>
						<input
							type="email"
							name="email"
							autoComplete="email"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</label>

					<label className="field">
						<span>Password</span>
						<input
							type="password"
							name="password"
							autoComplete="current-password"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</label>

					{error && <p className="error" role="alert">{error}</p>}

					<button className="primary" type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Signing in…' : 'Continue'}
					</button>
				</form>
			</div>
		</div>
	)
}

export default Login
