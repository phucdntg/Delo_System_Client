import { DeleteOutlined } from "@ant-design/icons";
import { useTranslate } from "@core/providers/translate";
import { Button, Modal } from "antd";
import { memo, useCallback, useState } from "react";
import { GoTrash } from "react-icons/go";

const DeleteButton = memo(({ onDelete, itemName }) => {
  const { translate } = useTranslate();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleOpen = useCallback(() => {
    setDeleting(false);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    if (!deleting) setOpen(false);
  }, [deleting]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await onDelete?.();
      setOpen(false);
    } catch {
      setDeleting(false);
    }
  }, [onDelete]);

  return (
    <>
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        onClick={handleOpen}
      />

      <Modal
        open={open}
        centered
        maskClosable={!deleting}
        onCancel={handleClose}
        footer={null}
        width={420}
        closable={!deleting}
        styles={{ body: { padding: "24px 24px 16px" } }}
      >
        <div className="flex flex-col items-center text-center pb-4 pt-2">
          <style>{`
            @keyframes sparkle-twinkle {
              0%, 100% { opacity: 0.2; transform: scale(0.6); }
              50% { opacity: 1; transform: scale(1.3); }
            }
            @keyframes sparkle-drift {
              0%, 100% { transform: translateY(0) translateX(0); }
              33% { transform: translateY(-4px) translateX(2px); }
              66% { transform: translateY(-2px) translateX(-2px); }
            }
            @keyframes trash-wobble {
              0%, 100% { transform: rotate(0deg); }
              15% { transform: rotate(-12deg) scale(1.05); }
              30% { transform: rotate(10deg) scale(1.05); }
              45% { transform: rotate(-6deg); }
              60% { transform: rotate(6deg); }
              80% { transform: rotate(-2deg); }
            }
            @keyframes shadow-throb {
              0%, 100% { opacity: 0.4; transform: scaleX(1); }
              50% { opacity: 0.9; transform: scaleX(1.25); }
            }
            @keyframes icon-enter {
              0% { transform: scale(0) rotate(-30deg); opacity: 0; }
              60% { transform: scale(1.15) rotate(4deg); opacity: 1; }
              100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
            @keyframes bg-enter {
              0% { transform: scale(0); opacity: 0; }
              60% { transform: scale(1.1); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>

          {/* Icon + sparkles */}
          <div className="relative flex items-center justify-center w-24 h-24 mb-2">
            <span
              className="absolute w-1.5 h-1.5 rounded-full bg-red-400 top-2 left-3"
              style={{
                animation:
                  "sparkle-twinkle 1.8s ease-in-out infinite, sparkle-drift 3s ease-in-out infinite",
              }}
            />
            <span
              className="absolute w-1 h-1 rounded-full bg-red-400 top-1 right-3"
              style={{
                animation:
                  "sparkle-twinkle 1.4s ease-in-out infinite, sparkle-drift 2.6s ease-in-out infinite",
                animationDelay: "0.3s",
              }}
            />
            <span
              className="absolute w-1 h-1 rounded-full bg-red-400 top-7 left-1"
              style={{
                animation:
                  "sparkle-twinkle 2s ease-in-out infinite, sparkle-drift 3.2s ease-in-out infinite",
                animationDelay: "0.6s",
              }}
            />
            <span
              className="absolute w-1 h-1 rounded-full bg-red-400 bottom-5 right-2"
              style={{
                animation:
                  "sparkle-twinkle 1.6s ease-in-out infinite, sparkle-drift 2.8s ease-in-out infinite",
                animationDelay: "0.9s",
              }}
            />
            <span
              className="absolute w-0.5 h-0.5 rounded-full bg-red-400 bottom-3 left-7"
              style={{
                animation:
                  "sparkle-twinkle 2.2s ease-in-out infinite, sparkle-drift 3.6s ease-in-out infinite",
                animationDelay: "0.4s",
              }}
            />

            <div
              className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center"
              style={{
                animation: "bg-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
              }}
            >
              <GoTrash
                className="text-3xl text-red-500"
                style={{
                  animation:
                    "icon-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both, trash-wobble 2.5s ease-in-out 0.65s infinite",
                  transformOrigin: "center",
                }}
              />
            </div>
          </div>

          {/* Shadow line */}
          <div
            className="w-16 h-1.5 mb-5"
            style={{
              background:
                "radial-gradient(ellipse 100% 100% at 50% 50%, #fca5a5 0%, transparent 70%)",
              animation: "shadow-throb 2.2s ease-in-out infinite",
            }}
          />

          {/* Title */}
          <p className="text-lg font-semibold text-gray-900 mb-2">
            {translate("common.confirm.delete.title", { item: itemName })}
          </p>

          {/* Description */}
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            {translate("common.confirm.delete.description")}
          </p>

          {/* Buttons */}
          <div className="flex gap-3 w-full">
            <Button
              block
              size="large"
              className="border-red-400! text-red-500! font-medium! hover:bg-red-50!"
              disabled={deleting}
              onClick={handleClose}
            >
              {translate("common.button.cancel")}
            </Button>

            <Button
              block
              size="large"
              danger
              type="primary"
              loading={deleting}
              className="font-medium!"
              onClick={handleDelete}
            >
              {translate("common.button.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
});

DeleteButton.displayName = "DeleteButton";

export default DeleteButton;
