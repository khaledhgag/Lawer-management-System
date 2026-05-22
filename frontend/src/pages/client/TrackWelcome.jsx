import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
export default function TrackWelcome() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}}>
        <div className="text-6xl mb-4">⚖️</div>
        <h1 className="text-4xl font-black mb-3">مرحبًا بك في نظام <span className="text-gold">متابعة القضايا</span></h1>
        <p className="text-white/70 mb-10">يمكنك متابعة قضيتك بحسابك الشخصي أو برقم القضية وكود التتبع.</p>
        <Link to="/track/login" className="btn-gold">المتابعة</Link>
      </motion.div>
    </div>
  );
}
