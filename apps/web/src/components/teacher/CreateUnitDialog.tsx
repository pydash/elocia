import { useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../Button";
import { createUnit } from "@/services/curriculum";

export default function CreateUnitDialog() {
  const { sectionId } = useParams<{ sectionId: string }>();

  const [isOpen, setIsOpen] = useState(false);
  const [unitTitle, setUnitTitle] = useState("");
  const [unitNumber, setUnitNumber] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateUnit = async () => {
    if (!sectionId || !unitTitle.trim() || unitNumber < 1) return;

    try {
      setIsCreating(true);

      await createUnit(sectionId, {
        title: unitTitle.trim(),
        unit_number: unitNumber,
      });

      setIsOpen(false);
      setUnitTitle("");
      setUnitNumber(1);
    } catch (error) {
      console.error("Error creating unit:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Create Unit</Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Create New Unit</h2>

            <div className="mb-4">
              <label
                htmlFor="unit-number"
                className="block text-sm font-medium text-gray-700"
              >
                Unit Number
              </label>

              <input
                id="unit-number"
                type="number"
                min={1}
                value={unitNumber}
                onChange={(e) => setUnitNumber(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter unit number"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="unit-title"
                className="block text-sm font-medium text-gray-700"
              >
                Unit Title
              </label>

              <input
                id="unit-title"
                type="text"
                value={unitTitle}
                onChange={(e) => setUnitTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter unit title"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsOpen(false)} disabled={isCreating}>
                Cancel
              </Button>

              <Button
                onClick={handleCreateUnit}
                disabled={!unitTitle.trim() || unitNumber < 1 || isCreating}
              >
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
