
import { Instagram, Linkedin } from "lucide-react";
import Link from "../ui/Link";

const Footer = () => {
  const currentYear = new Date().getFullYear();


  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features", type: "anchor" },
        { label: "Pricing", href: "#pricing", type: "anchor" },
        { label: "Dashboard", href: "/dashboard", type: "route" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#", type: "anchor" },
        { label: "Community", href: "#", type: "anchor" },
        { label: "Blog", href: "#", type: "anchor" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#", type: "anchor" },
        { label: "Terms of Service", href: "#", type: "anchor" },
        { label: "Cookie Policy", href: "#", type: "anchor" },
      ],
    },
  ];

  return (
    <footer className="border-t border-blue-700/50 bg-slate-900/50 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <img src="/logo.png" alt="DumpIt Logo" className="w-8 h-8" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">DumpIt</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Your Personal Digital Vault
              </p>
            </div>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/rayan9064.tech"
                className="w-10 h-10 rounded-lg bg-blue-950/50 border border-blue-700/50 backdrop-blur-xl flex items-center justify-center hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/in/rayan9064"
                className="w-10 h-10 rounded-lg bg-blue-950/50 border border-blue-700/50 backdrop-blur-xl flex items-center justify-center hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.type === "route" ? (
                      <Link href={link.href} className="text-gray-400 hover:text-white transition-colors duration-300">
                        {link.label}
                      </Link>
                    ) : link.type === "external" ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-300">
                        {link.label}
                      </a>
                    ) : (
                      <a href={link.href} className="text-gray-400 hover:text-white transition-colors duration-300">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-blue-700/50 text-center text-sm text-gray-400">
          <p>© {currentYear} DumpIt. Built for order, powered by privacy.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
