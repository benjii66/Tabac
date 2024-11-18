'use client';
import { motion } from 'framer-motion';

export default function MapSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Nous Trouver</h2>
          <p className="text-gray-600">46 rue des orangers, 66270 Le Soler</p>
        </motion.div>

        <div className="rounded-lg overflow-hidden shadow-lg">
          <iframe
            width="100%"
            height="600"
            src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=46,%20rue%20des%20orangers%20Le%20Soler+(Tabac%20Presse%20Le%20Soler)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed">
          </iframe>
        </div>
      </div>
      <h2 className=" pt-10 text-3xl font-bold text-gray-800 mb-4 text-center">Nous Contacter</h2>
      <p className="text-gray-600 text-center">04 68 73 86 59</p>
    </section>
  );
}