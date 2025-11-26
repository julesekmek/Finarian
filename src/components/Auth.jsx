/**
 * Auth component - Modern dark mode authentication screen
 * Inspired by Finary design with glassmorphism and smooth animations
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  TrendingUp,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { authService } from "../services/authService";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isSignUp) {
        console.log("Starting signup process...");
        const data = await authService.signUp(email, password);
        console.log("Signup response:", data);

        // Always show message if signup didn't throw an error
        // Supabase signup is successful even if email confirmation is required
        setMessage(
          "Compte créé ! Veuillez vérifier votre email pour confirmer."
        );
        console.log("Message set successfully");
      } else {
        await authService.signIn(email, password);
      }
    } catch (error) {
      console.error("Auth error:", error);
      setMessage(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4 py-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-beige/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 shadow-glow-primary"
          >
            <TrendingUp className="w-8 h-8 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-text-primary mb-2"
          >
            Finarian
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-text-secondary text-sm"
          >
            {isSignUp
              ? "Créer votre compte"
              : "Bon retour ! Connectez-vous pour continuer"}
          </motion.p>
        </div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="card glass"
        >
          <form onSubmit={handleAuth} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field w-full pl-12"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input-field w-full pl-12"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Alert Banner */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-2xl border backdrop-blur-sm ${
                  message.includes("créé") || message.includes("Compte créé")
                    ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30"
                    : "bg-accent-red/10 border-accent-red/20"
                }`}
              >
                <div className="flex items-start gap-4">
                  {message.includes("créé") ||
                  message.includes("Compte créé") ? (
                    <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-accent-red flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4
                      className={`font-semibold mb-1 ${
                        message.includes("créé") ||
                        message.includes("Compte créé")
                          ? "text-green-300"
                          : "text-accent-red"
                      }`}
                    >
                      {message.includes("créé") ||
                      message.includes("Compte créé")
                        ? "Compte en cours de création"
                        : "Erreur"}
                    </h4>
                    <p
                      className={`text-sm leading-relaxed ${
                        message.includes("créé") ||
                        message.includes("Compte créé")
                          ? "text-green-100/90"
                          : "text-accent-red/90"
                      }`}
                    >
                      {message.includes("créé") ||
                      message.includes("Compte créé") ? (
                        <>
                          Un email de confirmation a été envoyé à{" "}
                          <span className="font-medium text-green-200">
                            {email}
                          </span>
                          .
                          <br />
                          Veuillez cliquer sur le lien dans l'email pour activer
                          votre compte.
                        </>
                      ) : (
                        message
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Chargement...</span>
                </>
              ) : (
                <span>{isSignUp ? "S'inscrire" : "Se connecter"}</span>
              )}
            </button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="mt-6 pt-6 border-t border-border-subtle text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage("");
              }}
              className="text-accent-beige hover:text-accent-beige/80 text-sm font-medium transition-colors"
            >
              {isSignUp
                ? "Déjà un compte ? Se connecter"
                : "Pas de compte ? S'inscrire"}
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-text-muted text-xs mt-6"
        >
          Gérez votre portefeuille en toute confiance
        </motion.p>
      </motion.div>
    </div>
  );
}
