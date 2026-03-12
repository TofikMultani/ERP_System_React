import { Link } from "react-router-dom";

function Login() {
  return (
    <main className="login-page">
      <section className="login-page__panel">
        <div className="login-page__intro">
          <span className="login-page__eyebrow">ERP System</span>
          <h1>Sign in to continue</h1>
          <p>
            Static login screen for routing flow. Authentication is not
            connected yet.
          </p>
        </div>

        <form className="login-form">
          <label>
            <span>Email</span>
            <input type="email" placeholder="admin@erp.local" />
          </label>

          <label>
            <span>Password</span>
            <input type="password" placeholder="••••••••" />
          </label>

          <button type="button">Sign in</button>
        </form>

        <div className="login-page__footer">
          <p>Demo route access is enabled for UI development.</p>
          <Link to="/admin">Enter dashboard</Link>
        </div>
      </section>
    </main>
  );
}

export default Login;
