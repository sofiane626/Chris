'use client';
import { useEffect, useState } from 'react';
import LoadingSpinner from './loading';
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // Animations principales
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const smoothScale = useSpring(scale, { damping: 20 });
  
  // Nouveaux effets d'opacité
  const titleOpacity = useTransform(scrollYProgress, 
    [0, 0.2, 0.4], 
    [1, 0.8, 0]
  );
  const subtitleOpacity = useTransform(scrollYProgress, 
    [0, 0.25, 0.45], 
    [1, 0.7, 0]
  );
  const buttonOpacity = useTransform(scrollYProgress, 
    [0, 0.3, 0.5], 
    [1, 0.6, 0]
  );
  const bgOverlayOpacity = useTransform(scrollYProgress, 
    [0, 0.5], 
    [0.4, 0.7]
  );

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Image de fond avec effets combinés */}
      <motion.div
        style={{ scale: smoothScale }}
        className="absolute inset-0 z-0"
      >
        <img
          src="/images/image1.jpg"
          alt="Background"
          className="w-full h-full object-cover object-center"
        />
        <motion.div 
          style={{ opacity: bgOverlayOpacity }}
          className="absolute inset-0 bg-black"
        />
      </motion.div>

      {/* Contenu avec opacités liées au scroll */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={loaded ? { opacity: 0, y: 50 } : false}
            animate={{ opacity: 1, y: 0 }}
            style={{ opacity: titleOpacity }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
          >
            Chez Chris
          </motion.h1>

          <motion.p
            initial={loaded ? { opacity: 0, y: 30 } : false}
            animate={{ opacity: 1, y: 0 }}
            style={{ opacity: subtitleOpacity }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-8"
          >
            Votre barber shop préféré au cœur de Bruxelles.
          </motion.p>

          <motion.div
            initial={loaded ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            style={{ opacity: buttonOpacity }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
          >
            <button className="bg-white text-black px-8 py-3 rounded-lg font-medium text-lg hover:bg-white/90 transition-all duration-300 shadow-lg">
              Découvrir
            </button>
          </motion.div>
        </div>
      </div>

      {/* Indicateur de scroll avec effet de disparition */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ 
          opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0]) 
        }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className="animate-bounce w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
            }}
            className="w-1 h-2 bg-white rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <main className="pt-24">
      <HeroSection />

      {/* Section Contact */}
      <section id="contact" className="py-12 bg-black text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Adresse</h2>
                <p>
                  BOURSE<br />
                  Rue Grétry 27<br />
                  1000 Bruxelles<br />
                  Belgique
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Informations</h2>
                <p>
                  Du mardi au samedi<br />
                  De 10H00 à 19H00
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Contact</h2>
                <p>
                  <a href="mailto:barbershop@outlook.be" className="text-blue-400 hover:underline">Chris@outlook.be</a><br />
                  <a href="tel:+32465097764" className="text-blue-400 hover:underline">+32 (0)465 09 77 64</a>
                </p>
                <div className="flex space-x-4 mt-4">
                  <a href="https://www.facebook.com/bayer.bayersablon/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-white">
                    <i className="fab fa-facebook fa-lg"></i>
                  </a>
                  <a href="https://www.instagram.com/bayerandbayer/" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-white">
                    <i className="fab fa-instagram fa-lg"></i>
                  </a>
                </div>
              </div>
            </div>

            <div className="w-full h-[300px] md:h-auto">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d629.7540774375642!2d4.350688069686927!3d50.84938224495095!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c3c3873f3c7207%3A0x2e831f8264d56234!2sRue%20Gr%C3%A9try%2027%2C%201000%20Bruxelles!5e0!3m2!1sfr!2sbe!4v1753015570118!5m2!1sfr!2sbe"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg shadow-lg"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}