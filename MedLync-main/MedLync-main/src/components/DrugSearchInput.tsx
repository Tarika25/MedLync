import { useState, useEffect, useRef, useCallback } from "react";
import { searchDrugs, getGenericAlternative } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRightLeft, Pill, Info } from "lucide-react";

interface Drug {
  id: string;
  name: string;
  generic_name: string;
  category: string;
  standard_dosage: string;
  side_effects: string[];
  contraindications: string[];
  interactions: string[];
  brand_price: number;
  generic_price: number;
}

interface DrugSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onDrugSelect?: (drug: Drug) => void;
  onGenericSwitch?: (genericName: string) => void;
  allMedicineNames?: string[];
  placeholder?: string;
}

export default function DrugSearchInput({
  value,
  onChange,
  onDrugSelect,
  onGenericSwitch,
  allMedicineNames = [],
  placeholder = "Medicine name",
}: DrugSearchInputProps) {
  const [suggestions, setSuggestions] = useState<Drug[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [genericAlt, setGenericAlt] = useState<any>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [interactions, setInteractions] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = useCallback((q: string) => {
    onChange(q);
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchDrugs(q);
        setSuggestions(res.drugs || []);
        setShowSuggestions(true);
      } catch { }
    }, 300);
  }, [onChange]);

  const handleSelect = async (drug: Drug) => {
    onChange(drug.name);
    setSelectedDrug(drug);
    setShowSuggestions(false);
    setShowInfo(true);
    onDrugSelect?.(drug);

    // Check interactions with other medicines
    const otherMeds = allMedicineNames.filter(n => n && n.toLowerCase() !== drug.name.toLowerCase());
    const foundInteractions: string[] = [];
    otherMeds.forEach(med => {
      if (drug.interactions?.some(int => med.toLowerCase().includes(int.toLowerCase()) || int.toLowerCase().includes(med.toLowerCase()))) {
        foundInteractions.push(`⚠️ ${drug.name} and ${med} may interact and cause adverse effects`);
      }
    });
    setInteractions(foundInteractions);

    // Check generic alternative
    try {
      const alt = await getGenericAlternative(drug.name);
      setGenericAlt(alt.alternative);
    } catch {
      setGenericAlt(null);
    }
  };

  const handleSwitchGeneric = () => {
    if (genericAlt?.generic_name) {
      onChange(genericAlt.generic_name);
      onGenericSwitch?.(genericAlt.generic_name);
      setGenericAlt(null);
      setShowInfo(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center gap-1">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => value.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
        />
        {selectedDrug && (
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowInfo(!showInfo)}>
            <Info className="h-3.5 w-3.5 text-primary" />
          </Button>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((drug) => (
            <button
              key={drug.id}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm border-b border-border/50 last:border-0"
              onClick={() => handleSelect(drug)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span className="font-medium">{drug.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">{drug.category}</Badge>
              </div>
              {drug.generic_name && drug.generic_name !== drug.name && (
                <p className="text-xs text-muted-foreground mt-0.5 pl-5">Generic: {drug.generic_name}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Drug Info Tooltip */}
      {showInfo && selectedDrug && (
        <div className="mt-2 p-2.5 rounded-md bg-muted/50 border border-border text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">{selectedDrug.name}</span>
            <Badge variant="secondary" className="text-xs">{selectedDrug.category}</Badge>
          </div>
          <p><span className="text-muted-foreground">Standard dosage:</span> {selectedDrug.standard_dosage}</p>
          {selectedDrug.side_effects?.length > 0 && (
            <p><span className="text-muted-foreground">Side effects:</span> {selectedDrug.side_effects.join(", ")}</p>
          )}
          {selectedDrug.contraindications?.length > 0 && (
            <p className="text-destructive"><span className="font-medium">Contraindications:</span> {selectedDrug.contraindications.join(", ")}</p>
          )}

          {/* Interaction warnings */}
          {interactions.length > 0 && (
            <div className="p-2 rounded bg-destructive/10 border border-destructive/20 space-y-1">
              {interactions.map((w, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0 mt-0.5" />
                  <span className="text-destructive font-medium">{w}</span>
                </div>
              ))}
            </div>
          )}

          {/* Generic substitution */}
          {genericAlt && (
            <div className="p-2 rounded bg-success/10 border border-success/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-success">
                    Generic alternative: {genericAlt.generic_name}
                  </p>
                  {genericAlt.savings > 0 && (
                    <p className="text-success">Save ₹{genericAlt.savings} (₹{genericAlt.brand_price} → ₹{genericAlt.generic_price})</p>
                  )}
                </div>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs border-success/30 text-success hover:bg-success/10" onClick={handleSwitchGeneric}>
                  <ArrowRightLeft className="h-3 w-3 mr-1" /> Switch
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
