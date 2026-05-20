export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-8">
        <div className="text-center">
          <h1 className="font-montserrat text-2xl font-bold tracking-tight">ALG3 Hub</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Entre com suas credenciais para acessar o hub.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
          Auth em breve. Acesse <a href="/" className="underline">o hub</a> diretamente.
        </div>
      </div>
    </div>
  )
}
