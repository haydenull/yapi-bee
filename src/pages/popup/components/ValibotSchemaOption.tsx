import { Dropdown, Switch } from 'antd';
import { useState } from 'react';
import { GenValibotSchemaOption, defaultGenValidSchemaOption } from '../helper/genValibot';

interface ValibotSchemaOptionProps {
    onChange(value: GenValibotSchemaOption): void;
}

export function ValibotSchemaOption(props: ValibotSchemaOptionProps) {
    const [value, _setValue] = useState<GenValibotSchemaOption>(() => ({ ...defaultGenValidSchemaOption }));

    function setValue(v: GenValibotSchemaOption) {
        _setValue(v);
        props.onChange(v);
    }

    return (
        <div className='flex flex-row gap-x-5 items-center font-normal'>
            <div className='flex items-center'>
                <span className='mr-2'>注释</span>
                <Switch
                    checked={value.descriptionToComment}
                    onChange={checked => {
                        setValue({ ...value, descriptionToComment: checked });
                    }}
                />
            </div>
            <div className='flex items-center'>
                <span className='mr-2'>import 注入</span>
                <Switch
                    checked={value.withImport}
                    onChange={checked => {
                        setValue({ ...value, withImport: checked });
                    }}
                />
            </div>
            <Dropdown
                menu={{
                    onClick(m) {
                        setValue({ ...value, wrapEmpty: m.key as GenValibotSchemaOption['wrapEmpty'] });
                    },
                    items: [
                        {
                            label: 'optional',
                            key: 'optional',
                        },
                        {
                            label: 'nullable',
                            key: 'nullable',
                        },
                        {
                            label: 'both',
                            key: 'both',
                        },
                    ],
                }}>
                <div>空值: {value.wrapEmpty}</div>
            </Dropdown>
        </div>
    );
}
