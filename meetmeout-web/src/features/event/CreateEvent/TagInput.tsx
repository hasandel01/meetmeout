import {useState} from 'react';
import styles from "./CreateEvent.module.css"


const TagInput = ({tags, setTags}: {tags: string[], setTags: (tags: string[]) => void }) => {
    const [input,setInput] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if(e.key === "Enter" || e.key === "," || e.key === " ") {
            e.preventDefault(); 
            if(input.trim() !== '' && !tags.includes(input.trim())) {
                setTags([...tags, input.trim()])
                setInput('')
            }
        }
    }

    const removeTag = (index: number) => {
        setTags(tags.filter((_,i) => i !== index))
    }

    return (
        <div className={styles.tagInputContainer}>
        <input
          type="text"
          disabled={tags.length >= 5 ? true : false}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length >= 5 ? "Tag limit is reached." : "Enter tags..."}
          style={{ border: "none", outline: "none" }}
        />
        {tags.map((tag, index) => (
          <span key={index}>
            <label onClick={() => removeTag(index)}>
              {tag} 
            </label>
          </span>
        ))}
      </div>
    );
}


export default TagInput;