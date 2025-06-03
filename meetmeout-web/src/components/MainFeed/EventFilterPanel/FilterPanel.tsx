import styles from "./FilterPanel.module.css";
import Select from 'react-select';
import { categoryMap } from "../../../mapper/CategoryMap";

interface FilterPanelProps {
  onSortChange: (value: string) => void;
  onCategoryChange: (category: string) => void;
  onShowPastEventsChange: (show: boolean) => void;
  onShowFreeEventsChange: (freeOnly: boolean) => void;
  onFilterGroupChange: (group: 'All Events' | 'My Events' | 'My Drafts') => void;
  onlyPublicEvents: boolean;
  onOnlyPublicEventsChange: (val: boolean) => void;
}

type OptionType = {
  value: string;
  label: string;
};

const FilterPanel = ({
  onSortChange,
  onCategoryChange,
  onShowPastEventsChange,
  onShowFreeEventsChange,
  onFilterGroupChange,
  onlyPublicEvents,
  onOnlyPublicEventsChange
}: FilterPanelProps) => {

  const categoryOptions: OptionType[] = Object.entries(categoryMap).map(([value, label]) => ({
    value,
    label
  }));

  return (
    <div className={styles.mainFeedContainerFilter}>
      <div className={styles.selections}>
        <label onClick={() => onFilterGroupChange("All Events")}>
          All Available Events                    
        </label>
        <label onClick={() => onFilterGroupChange("My Events")}>
          My Events
        </label>
        <label onClick={() => onFilterGroupChange("My Drafts")}>
          My Drafts
        </label>
        <label className={styles.toggleWrapper}>
          <input
            type="checkbox"
            onChange={(e) => onShowPastEventsChange(e.target.checked)}
          />
          <span className={styles.slider}></span>
          <span className={styles.labelText}>
            Show Past Events
          </span>
        </label>
        <label>
          <input 
            type="checkbox"
            onChange={(e) => onShowFreeEventsChange(e.target.checked)}
          /> Free to Join
        </label>
        <label>
        <input 
          type="checkbox"
          checked={onlyPublicEvents}
          onChange={(e) => onOnlyPublicEventsChange(e.target.checked)}
        /> Only Public Events
      </label>
        <div className={styles.categoryFilterContainer}>
          <Select
          isClearable
          options={categoryOptions}
          onChange={(selected) => onCategoryChange(selected?.value || '')}
          placeholder="Choose category"
        />
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
