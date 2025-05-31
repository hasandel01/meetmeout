import { useState } from "react";
import styles from "./FilterPanel.module.css";
import Select, {MultiValue} from 'react-select'
import { categoryMap } from "../../../mapper/CategoryMap";

interface FilterPanelProps {
  setGlobalFilter: (filter: string) => void;
  showPastEvents: boolean;
  setShowPastEvents: (val: boolean) => void;
  onSortChange: (value: string) => void;
}

type OptionType = {
  value: string;
  label: string;
};

const FilterPanel = ({
  setGlobalFilter,
  showPastEvents,
  setShowPastEvents,
  onSortChange
}: FilterPanelProps) => {

  const [showFreeEvents, setShowFreeEvents] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categoryOptions: OptionType[] =  Object.entries(categoryMap).map(([value , label]) => (
    {
      value,
      label
    }
  ));

  const handleSelectedCategories = (selectedCategories: MultiValue<OptionType>) => {
    const selected = selectedCategories.map((cat) => cat.value);
    setSelectedCategories(selected);
    console.log(selectedCategories)
  }

  return (
    <div className={styles.mainFeedContainerFilter}>
      <div className={styles.selections}>
        <label onClick={() => setGlobalFilter("All Events")}>
          All Available Events                    
        </label>
        <label onClick={() => setGlobalFilter("My Events")}>
          My Events
        </label>
        <label onClick={() => setGlobalFilter("My Drafts")}>
          My Drafts
        </label>
        <label className={styles.toggleWrapper}>
          <input
            type="checkbox"
            checked={showPastEvents}
            onChange={(e) => setShowPastEvents(e.target.checked)}
          />
          <span className={styles.slider}></span>
          <span className={styles.labelText}>
            {showPastEvents ? "Showing past events" : "Hide past events"}
          </span>
        </label>
        <label>
          <input 
            type="checkbox"
            checked={showFreeEvents}
            onChange={(e) => setShowFreeEvents(e.target.checked)}
          /> Free to Join
        </label>
        <div className={styles.categoryFilterContainer}>
          <Select
            isMulti
            options={categoryOptions}
            onChange={handleSelectedCategories}
            placeholder="Choose categories"
            ></Select>
        </div>
      </div>
      <div className={styles.sort}>
        <label>Sort by:  </label>
        <select onChange={(e) => onSortChange(e.target.value)}>
          <option value="Soonest">Soonest</option>
          <option value="Latest">Latest</option>
          <option value="Recently Added">Recently Added</option>
          <option value="Most Liked">Most Liked</option>
          <option value="Most Attended">Most Attended</option>
          <option value="Nearest">Nearest</option>
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;
