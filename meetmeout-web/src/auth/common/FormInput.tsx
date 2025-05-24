import React from "react";
import styles from "../common/Form.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: any;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
}

const FormInput: React.FC<FormInputProps> = ({ icon, type, value, onChange, placeholder, label, ...rest}) => (
  <div className={styles.inputGroup}>
    {label && <label>{label}</label>}
    <div className={styles.inputElement}>
      <FontAwesomeIcon icon={icon} />
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...rest}
      />
    </div>
  </div>
);

export default FormInput;
