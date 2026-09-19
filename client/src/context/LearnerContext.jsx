import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as api from "../services/api";

const EduPathContext = createContext(null);

function normalizeSkill(value) {
  if (typeof value === "string") return { name: value.trim(), level: 3, confidence: "learning", evidence: "" };
  const skill = value || {};
  return {
    name: String(skill.name || "").trim(),
    level: Number(skill.level) || 1,
    confidence: skill.confidence || "learning",
    evidence: skill.evidence || "",
  };
}

export function EduPathProvider({ children }) {
  const [user, setUser] = useState(() => api.getStoredUser());
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [gapMeta, setGapMeta] = useState({ source: null, derivedFrom: null });
  const [plan, setPlan] = useState(null);
  const [report, setReport] = useState(null);
  const [agentMode, setAgentMode] = useState("FALLBACK");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, tone = "info") => {
    setToast({ message, tone, id: Date.now() });
    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(() => setToast(null), 4200);
  }, []);

  // Resolve session validity and AI mode on boot.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!api.getToken()) {
        setAuthReady(true);
        return;
      }
      try {
        const health = await api.getHealth();
        if (!cancelled) setAgentMode(health?.agentMode || "FALLBACK");
        const profileRes = await api.getProfile();
        if (!cancelled) {
          setProfile(profileRes?.profile || null);
          setUser(api.getStoredUser());
        }
        // Restore the rest of the learner state so a page refresh keeps the
        // full demo context (PRD: refreshing must not destroy demo state).
        const [gapsRes, planRes, reportRes] = await Promise.all([
          api.fetchGaps().catch(() => null),
          api.fetchCurrentPlan().catch(() => null),
          api.fetchReport().catch(() => null),
        ]);
        if (!cancelled) {
          setGaps(gapsRes?.gaps || []);
          setPlan(planRes?.plan || null);
          setReport(reportRes || null);
        }
      } catch {
        if (!cancelled) {
          api.clearSession();
          setUser(null);
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshPlan = useCallback(async () => {
    try {
      const res = await api.fetchCurrentPlan();
      setPlan(res?.plan || null);
      return res?.plan || null;
    } catch {
      return null;
    }
  }, []);

  const refreshGaps = useCallback(async () => {
    try {
      const res = await api.fetchGaps();
      setGaps(res?.gaps || []);
      return res?.gaps || [];
    } catch {
      return [];
    }
  }, []);

  const refreshReport = useCallback(async () => {
    try {
      const res = await api.fetchReport();
      setReport(res || null);
      return res || null;
    } catch {
      return null;
    }
  }, []);

  const applySession = useCallback((token, nextUser) => {
    api.setSession(token, nextUser);
    setUser(nextUser);
    setProfile(null);
    setGaps([]);
    setPlan(null);
    setReport(null);
  }, []);

  const loadDemo = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.loadDemoSeed();
      applySession(res.token, res.user);
      const profileRes = await api.getProfile();
      setProfile(profileRes?.profile || null);
      const health = await api.getHealth();
      setAgentMode(health?.agentMode || "FALLBACK");
      await Promise.all([refreshGaps(), refreshPlan(), refreshReport()]);
      showToast("Aditi demo loaded — profile, gaps and Week 1 plan are ready.", "success");
      return true;
    } catch (error) {
      showToast(error.message || "Could not load the demo.", "error");
      return false;
    } finally {
      setLoading(false);
    }
  }, [applySession, refreshGaps, refreshPlan, refreshReport, showToast]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      applySession(res.token, res.user);
      const profileRes = await api.getProfile().catch(() => ({ profile: null }));
      setProfile(profileRes?.profile || null);
      await Promise.all([refreshGaps(), refreshPlan(), refreshReport()]);
      return true;
    } catch (error) {
      showToast(error.message || "Sign in failed.", "error");
      return false;
    } finally {
      setLoading(false);
    }
  }, [applySession, refreshGaps, refreshPlan, refreshReport, showToast]);

  const signup = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.signup(name, email, password);
      applySession(res.token, res.user);
      showToast("Welcome to EduPath! Save your profile to begin.", "success");
      return true;
    } catch (error) {
      showToast(error.message || "Sign up failed.", "error");
      return false;
    } finally {
      setLoading(false);
    }
  }, [applySession, showToast]);

  const logout = useCallback(() => {
    api.clearSession();
    setUser(null);
    setProfile(null);
    setGaps([]);
    setPlan(null);
    setReport(null);
  }, []);

  const saveProfile = useCallback(async (draft) => {
    setLoading(true);
    try {
      const res = await api.saveProfile(draft);
      setProfile(res.profile);
      showToast("Profile saved. Ready for a gap analysis.", "success");
      return true;
    } catch (error) {
      showToast(error.message || "Could not save the profile.", "error");
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const analyze = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.analyzeGaps();
      setGaps(res.gaps || []);
      setGapMeta({ source: res.source, derivedFrom: res.derivedFrom });
      showToast("Gap analysis complete.", "success");
      return true;
    } catch (error) {
      showToast(error.message || "Gap analysis failed.", "error");
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.generatePlan();
      setPlan({ ...res.plan, tasks: res.tasks });
      showToast("Your weekly plan is ready.", "success");
      return true;
    } catch (error) {
      showToast(error.message || "Plan generation failed.", "error");
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const revise = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.revisePlan();
      setPlan({ ...res.plan, tasks: res.tasks } );
      setPlan((current) => ({ ...(current || {}), ...res.plan, tasks: res.tasks }));
      const refreshed = await api.fetchCurrentPlan();
      if (refreshed?.plan) setPlan(refreshed.plan);
      showToast("The plan was revised based on your task outcomes.", "success");
      return res.adaptation || null;
    } catch (error) {
      showToast(error.message || "Plan revision failed.", "error");
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const setTaskStatus = useCallback(async (taskId, status, note) => {
    // Optimistic update so the UI reacts instantly.
    setPlan((current) =>
      current
        ? {
            ...current,
            tasks: (current.tasks || []).map((task) =>
              task.id === taskId ? { ...task, status } : task,
            ),
          }
        : current,
    );
    try {
      const res = await api.setTaskStatus(taskId, status, note);
      if (res.task) {
        setPlan((current) =>
          current
            ? {
                ...current,
                tasks: (current.tasks || []).map((task) =>
                  task.id === res.task.id ? res.task : task,
                ),
              }
            : current,
        );
      }
      if (res.insertedTask && res.insertedTask.title) {
        setPlan((current) => {
          if (!current) return current;
          const exists = (current.tasks || []).some((task) => task.id === res.insertedTask.id);
          return exists
            ? current
            : {
                ...current,
                tasks: [...(current.tasks || []), res.insertedTask],
              };
        });
      }
      showToast(res.message || "Task updated.", "success");
      return res;
    } catch (error) {
      showToast(error.message || "Could not update the task.", "error");
      await refreshPlan();
      return null;
    }
  }, [refreshPlan, showToast]);

  const ask = useCallback(async (message) => {
    return api.sendChatMessage(message);
  }, []);

  const value = useMemo(
    () => ({
      user,
      authReady,
      profile,
      skills: (profile?.skills || []).map(normalizeSkill),
      gaps,
      gapMeta,
      plan,
      planTasks: plan?.tasks || [],
      report,
      agentMode,
      loading,
      toast,

      showToast,
      loadDemo,
      login,
      signup,
      logout,
      saveProfile,
      analyze,
      generate,
      revise,
      setTaskStatus,
      refreshPlan,
      refreshGaps,
      refreshReport,
      ask,
    }),
    [
      user, authReady, profile, gaps, gapMeta, plan, report, agentMode, loading, toast,
      showToast, loadDemo, login, signup, logout, saveProfile, analyze, generate, revise,
      setTaskStatus, refreshPlan, refreshGaps, refreshReport, ask,
    ],
  );

  return <EduPathContext.Provider value={value}>{children}</EduPathContext.Provider>;
}

export function useEduPath() {
  const context = useContext(EduPathContext);
  if (!context) throw new Error("useEduPath must be used within an EduPathProvider");
  return context;
}
