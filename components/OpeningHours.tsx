'use client';
import { motion } from 'framer-motion';
import { FaClock } from 'react-icons/fa';

const hours = [
  { day: 'Lundi', hours: '7h00 - 19h00' },
  { day: 'Mardi', hours: '7h00 - 19h00' },
  { day: 'Mercredi', hours: '7h00 - 19h00' },
  { day: 'Jeudi', hours: '7h00 - 19h00' },
  { day: 'Vendredi', hours: '7h00 - 19h00' },
  { day: 'Samedi', hours: '7h00-12h30 -> 14h30-19h00' },
  { day: 'Dimanche', hours: '8h00 - 12h30' },
];

export default function OpeningHours() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <FaClock className="text-red-600 text-2xl" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Horaires d'ouverture
            </h2>
          </div>
          <div className="bg-stone-50 rounded-lg p-4 sm:p-6 shadow-lg">
            {hours.map((item, index) => (
              <motion.div
                key={item.day}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex justify-between text-sm sm:text-base py-2 border-b border-gray-200 last:border-0"
              >
                <span className={`font-medium ${document.body.classList.contains('night-mode') ? 'text-white' : 'text-gray-800'}`}>
                  {item.day}
                </span>
                <span className={`text-sm ${document.body.classList.contains('night-mode') ? 'text-white' : 'text-gray-600'}`}>
                  {item.hours}
                </span>

              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>

  );
}