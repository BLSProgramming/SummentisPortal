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
			const res = await fetch('/api/portal-login', {
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
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-8">
					<header className="mb-8">
						<p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-2">Welcome back</p>
						<h1 className="text-3xl font-bold text-white mb-2">Sign in</h1>
						<p className="text-slate-400">Enter your email and password to continue.</p>
					</header>

					<form className="space-y-5" onSubmit={handleSubmit}>
						<div>
							<label className="block text-sm font-semibold text-slate-200 mb-2">
								Email
							</label>
							<input
								type="email"
								name="email"
								autoComplete="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
							/>
						</div>

						<div>
							<label className="block text-sm font-semibold text-slate-200 mb-2">
								Password
							</label>
							<input
								type="password"
								name="password"
								autoComplete="current-password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
							/>
						</div>

						{error && (
							<div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3">
								<p className="text-sm text-red-400" role="alert">{error}</p>
							</div>
						)}

						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
						>
							{isSubmitting ? 'Signing in…' : 'Continue'}
						</button>
					</form>
				</div>
			</div>
		</div>
	)
}

export default Login
