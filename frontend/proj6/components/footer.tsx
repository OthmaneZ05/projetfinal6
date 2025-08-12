import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react"

export function Footer() {
  const footerLinks = {
    company: [
      { name: "À propos", href: "/about" },
      { name: "Comment ça marche", href: "/how-it-works" },
      { name: "Sécurité", href: "/safety" },
      { name: "Carrières", href: "/careers" },
    ],
    support: [
      { name: "Centre d'aide", href: "/help" },
      { name: "Nous contacter", href: "/contact" },
      { name: "Signaler un problème", href: "/report" },
      { name: "FAQ", href: "/faq" },
    ],
    legal: [
      { name: "Conditions d'utilisation", href: "/terms" },
      { name: "Politique de confidentialité", href: "/privacy" },
      { name: "Mentions légales", href: "/legal" },
      { name: "Cookies", href: "/cookies" },
    ],
  }

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">L</span>
              </div>
              <span className="text-xl font-bold text-primary">Loc'Partage</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              La plateforme de location de matériel entre particuliers. Partagez, économisez, créez du lien social.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Liens entreprise */}
          <div>
            <h3 className="font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liens support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liens légaux */}
          <div>
            <h3 className="font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">© 2024 Loc'Partage. Tous droits réservés.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="h-4 w-4 mr-1" />
              contact@locpartage.fr
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="h-4 w-4 mr-1" />
              01 23 45 67 89
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
