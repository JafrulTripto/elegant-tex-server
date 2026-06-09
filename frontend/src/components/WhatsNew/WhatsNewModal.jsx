import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "antd";
import { useStateContext } from "../../contexts/ContextProvider";
import useAxiosClient from "../../axios-client";

const WhatsNewModal = () => {
  const { unseenReleases, setUnseenReleases } = useStateContext();
  const axiosClient = useAxiosClient();
  // Track which release index is currently shown (newest first)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(false);
  // Prevent re-showing if user navigates and component remounts in same session
  const acknowledgedThisSession = useRef(false);

  useEffect(() => {
    if (unseenReleases.length > 0 && !acknowledgedThisSession.current) {
      setOpen(true);
    }
  }, [unseenReleases]);

  const handleDone = () => {
    acknowledgedThisSession.current = true;
    setOpen(false);
    setUnseenReleases([]);
    axiosClient.post("releases/acknowledge").catch(() => {
      // Non-fatal — worst case the modal shows again next login
    });
  };

  const handleNext = () => {
    if (currentIndex < unseenReleases.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleDone();
    }
  };

  if (!open || unseenReleases.length === 0) return null;

  const release = unseenReleases[currentIndex];
  const isLast = currentIndex === unseenReleases.length - 1;
  const hasMultiple = unseenReleases.length > 1;

  return (
    <Modal
      open={open}
      onCancel={handleDone}
      footer={null}
      centered
      width={480}
      closable
      maskClosable={false}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-6 pt-6 pb-4 -mx-6 -mt-6 rounded-t-lg mb-4"
        style={{ background: "linear-gradient(135deg, #492E87 0%, #6B46C1 100%)" }}
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl flex-shrink-0">
          🎉
        </div>
        <div>
          <p className="text-purple-200 text-xs font-medium mb-0.5 uppercase tracking-wide">
            {hasMultiple
              ? `What's New · ${currentIndex + 1} of ${unseenReleases.length}`
              : "What's New"}
          </p>
          <h2 className="text-white font-bold text-base leading-tight m-0">
            {release.title}
          </h2>
        </div>
      </div>

      {/* Feature list */}
      <div className="space-y-3 mb-6 px-1">
        {(release.features ?? []).map((feature, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-purple-50 dark:bg-purple-900/20">
              {feature.icon}
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-0.5">
                {feature.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed m-0">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700">
        {hasMultiple ? (
          <div className="flex gap-1.5">
            {unseenReleases.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === currentIndex ? 20 : 6,
                  background: i === currentIndex ? "#492E87" : "#E2D9F3",
                }}
              />
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-400">{release.released_at}</span>
        )}
        <Button
          type="primary"
          onClick={handleNext}
          style={{ background: "#492E87", border: "none" }}
        >
          {isLast ? "Got it" : "Next"}
        </Button>
      </div>
    </Modal>
  );
};

export default WhatsNewModal;
