import { useState, useEffect } from 'react';
import { HomeScreen } from '@/components/HomeScreen';
import { SessionView } from '@/components/SessionView';
import { TeacherDashboard } from '@/components/TeacherDashboard';
import { FinalReview } from '@/components/FinalReview';
import { sessions } from '@/data/sessions';
import { supabase } from '@/lib/supabase';
import type { AssessmentSession } from '@/types/assessment';

type View = 'home' | 'session' | 'dashboard' | 'final';

function App() {
  const [view, setView] = useState<View>('home');
  const [activeSession, setActiveSession] = useState<AssessmentSession | null>(null);
  const [completedSessions, setCompletedSessions] = useState<number[]>([]);

  useEffect(() => {
    async function loadCompleted() {
      const { data } = await supabase
        .from('assessment_results')
        .select('session_id, status')
        .in('status', ['submitted', 'reviewed']);

      if (data) {
        setCompletedSessions(data.map(d => d.session_id));
      }
    }
    loadCompleted();
  }, [view]);

  const handleStartSession = (session: AssessmentSession) => {
    setActiveSession(session);
    setView('session');
  };

  const handleBackToHome = () => {
    setActiveSession(null);
    setView('home');
  };

  const handleComplete = () => {
    setActiveSession(null);
    setView('home');
  };

  if (view === 'session' && activeSession) {
    return <SessionView session={activeSession} onBack={handleBackToHome} onComplete={handleComplete} />;
  }

  if (view === 'dashboard') {
    return <TeacherDashboard onBack={handleBackToHome} />;
  }

  if (view === 'final') {
    return <FinalReview onBack={handleBackToHome} />;
  }

  return (
    <HomeScreen
      onStartSession={handleStartSession}
      onTeacherDashboard={() => setView('dashboard')}
      onFinalReview={() => setView('final')}
      completedSessions={completedSessions}
    />
  );
}

export default App;
