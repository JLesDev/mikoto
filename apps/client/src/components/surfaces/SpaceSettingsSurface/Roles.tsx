/* eslint-disable no-bitwise */
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box,
  Flex,
  Button,
  Grid,
  Heading,
  Input,
  Toggle,
  Form,
  Buttons,
} from '@mikoto-io/lucid';
import { Space, Role, Permissions } from 'mikotojs';
import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

import { useMikoto } from '../../../hooks';
import { SettingsView } from '../../../views/SettingsViewTemplate';
import { useContextMenu } from '../../ContextMenu';

const SidebarButton = styled.a<{ selected?: boolean }>`
  display: block;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 4px;
  background-color: ${(p) =>
    p.selected ? p.theme.colors.N700 : 'transparent'};
  color: ${(p) => (p.selected ? 'white' : 'rgba(255,255,255,0.8)')};
  user-select: none;
`;

const ColorDot = styled.span<{ color?: string }>`
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 12px;
  border-radius: 999px;
  background-color: ${(p) => p.color ?? '#99AAB5'};
`;

const rolePermissionData = [
  { name: 'Superuser', permission: Permissions.space.superuser },
  { name: 'Manage Space', permission: Permissions.space.manageSpace },
  { name: 'Manage Channel', permission: Permissions.space.manageChannels },
  { name: 'Manage Roles', permission: Permissions.space.manageRoles },
];

const StyledColorPicker = styled(HexColorPicker)`
  &.react-colorful {
    height: 150px;
  }
`;

type ColorPickerProps = Partial<{
  value: string | null;
  onChange: (x: string | null) => void;
}>;

const defaultColors = [
  '#F80688',
  '#AD0DF2',
  '#006FFF',
  '#00D68B',
  '#FF981A',
  '#f72649',
];

function RoleColorPicker({ value, onChange }: ColorPickerProps) {
  const menu = useContextMenu(() => (
    <StyledColorPicker color={value ?? '#006FFF'} onChange={onChange} />
  ));
  return (
    <Flex p={{ y: 16 }} gap={8}>
      <Box w={64} h={64} bg={value ?? 'N400'} rounded={4} onClick={menu} />
      <Flex
        center
        fs={32}
        w={64}
        h={64}
        bg="N300"
        txt="N400"
        rounded={4}
        onClick={() => {
          onChange?.(null);
        }}
      >
        <FontAwesomeIcon icon={faCircleXmark} />
      </Flex>
      <Flex gap={8}>
        {defaultColors.map((x) => (
          <Box
            w={32}
            h={32}
            bg={x}
            rounded={4}
            key={x}
            onClick={() => onChange?.(x)}
          />
        ))}
      </Flex>
    </Flex>
  );
}

function RolePermissionEditor({
  permissions,
  onChange,
}: {
  permissions: string;
  onChange?: (x: string) => void;
}) {
  const perm = BigInt(permissions);

  return (
    <Box>
      {rolePermissionData.map((x) => (
        <Box p={{ y: 16 }} key={x.permission.toString()}>
          <Flex style={{ justifyContent: 'space-between' }}>
            <Heading as="h3" m={0}>
              {x.name}
            </Heading>
            <Toggle
              checked={Permissions.check(x.permission, perm)}
              onChange={(t) => {
                // if X is true, switch the bitset to 1
                // if X is false, switch the bitset to 0

                if (t) {
                  onChange?.((perm | x.permission).toString());
                } else {
                  onChange?.((perm & ~x.permission).toString());
                }
              }}
            />
          </Flex>
          <Box txt="N300">Description of the perm goes here.</Box>
        </Box>
      ))}
    </Box>
  );
}

const StyledRoleEditor = styled(Form)`
  overflow-y: scroll;
`;

function RoleEditor({ role, space }: { space: Space; role: Role }) {
  const mikoto = useMikoto();
  const form = useForm({
    defaultValues: {
      name: role.name,
      position: role.position,
    },
  });
  const [perms, setPerms] = useState(role.permissions);
  const [color, setColor] = useState<string | null>(role.color);

  return (
    <StyledRoleEditor
      p={16}
      h="100%"
      onSubmit={form.handleSubmit((d) => {
        const data = { ...d, permissions: perms, color };
        mikoto.client.roles.edit(role.id, data).then((x) => {
          console.log(x);
        });
      })}
    >
      <h2>Edit {role.name}</h2>

      {role.name !== '@everyone' && (
        <>
          <Input labelName="Role Name" {...form.register('name')} />
          <Input
            labelName="Role Priority"
            type="number"
            {...form.register('position', { valueAsNumber: true })}
          />
          <RoleColorPicker value={color} onChange={setColor} />
        </>
      )}

      <RolePermissionEditor permissions={perms} onChange={setPerms} />
      <Buttons>
        <Button variant="primary" type="submit">
          Save Changes
        </Button>
        {role.name !== '@everyone' && (
          <Button variant="danger">Delete Role</Button>
        )}
      </Buttons>
    </StyledRoleEditor>
  );
}

export function RolesSubsurface({ space }: { space: Space }) {
  // const rolesDelta = useDelta(space.roles, [space.id]);
  const mikoto = useMikoto();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const role = space.roles.find((x) => x.id === selectedRoleId);
  // const role = rolesDelta.data.find((x) => x.id === selectedRoleId);
  return (
    <SettingsView style={{ paddingRight: 0 }}>
      <Grid w="100%" h="100%" tcol="200px auto">
        <Box>
          <Button
            onClick={() => {
              mikoto.client.roles.create(space.id, 'New Role').then(() => {
                console.log('role created');
              });
            }}
          >
            New Role
          </Button>
          {space.roles.map((r) => (
            <SidebarButton
              key={r.id}
              selected={selectedRoleId === r.id}
              onClick={() => setSelectedRoleId(r.id)}
            >
              <ColorDot color={r.color ?? undefined} />
              {r.name}
            </SidebarButton>
          ))}
        </Box>
        {role && <RoleEditor role={role} space={space} key={role.id} />}
      </Grid>
    </SettingsView>
  );
}
