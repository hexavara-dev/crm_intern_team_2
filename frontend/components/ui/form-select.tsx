import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Controller,
  RegisterOptions,
  get,
  useFormContext,
} from "react-hook-form";
import { LabelText } from "./label-text";

export type SelectOptions = {
  label: string;
  value: string;
};

type InputSelectProps = {
  options: SelectOptions[];
  name: string;
  isLoading?: boolean;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  labelClassname?: string;
  validation?: RegisterOptions;
} & React.HTMLAttributes<HTMLSelectElement>;

export default function FormSelect({
  label,
  name,
  labelClassname,
  className,
  disabled,
  isLoading,
  placeholder,
  validation,
  options,
}: InputSelectProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = get(errors, name);

  return (
    <Controller
      control={control}
      name={name}
      rules={validation}
      render={({ field }) => (
        <>
          <div>
            {label && <LabelText className={labelClassname}>{label}</LabelText>}
            <Select
              disabled={disabled || isLoading}
              onValueChange={field.onChange}
              value={field.value}
            >
              <SelectTrigger
                className={cn(className, error && "border-destructive")}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent className="z-[999]">
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    />
  );
}
