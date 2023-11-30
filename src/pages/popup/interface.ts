export type IInteger = {
    type: 'integer';
    description?: string;
};
export type INumber = {
    type: 'number';
    description?: string;
};
export type IBoolean = {
    type: 'boolean';
    description?: string;
};
export type IString = {
    type: 'string';
    description?: string;
};
export type IArray = {
    type: 'array';
    items: IData;
    description?: string;
};
export type IObject = {
    type: 'object';
    properties: Record<string, IData>;
    description?: string;
    required: string[];
};

export type IData = IInteger | IString | IArray | IObject | INumber | IBoolean;
