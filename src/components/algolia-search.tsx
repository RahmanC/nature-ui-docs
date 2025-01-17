import { DocSearchModal, useDocSearchKeyboardEvents } from '@docsearch/react';
import {
	Box,
	HTMLNatureProps,
	Portal,
	Stack,
	VisuallyHidden,
} from '@nature-ui/core';
import { SearchIcon } from '@nature-ui/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

const ACTION_KEY_DEFAULT = ['Ctrl', 'Control'];
const ACTION_KEY_APPLE = ['⌘', 'Command'];

function Hit(props) {
	const { hit, children } = props as any;
	return <Link href={hit.url}>{children}</Link>;
}

export const SearchButton = React.forwardRef(
	(
		props: HTMLNatureProps<'button'>,
		ref: React.Ref<HTMLButtonElement> | null
	) => {
		const [actionKey, setActionKey] =
			React.useState<string[]>(ACTION_KEY_APPLE);

		React.useEffect(() => {
			if (typeof navigator === 'undefined') return;

			const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

			if (!isMac) {
				setActionKey(ACTION_KEY_DEFAULT);
			}
		}, []);

		return (
			<Box
				as='button'
				ref={ref}
				{...props}
				variant='none'
				className='hidden w-full lg:flex items-center text-sm leading-6 text-slate-400 rounded-md ring-1 ring-slate-900/10 shadow-sm py-1.5 pl-2 pr-3 hover:ring-slate-300'
			>
				<SearchIcon className='mr-3 ml-1' size='md' />
				<p className='text-gray-500'>Quick search...</p>

				<Stack row spacing='4px' className='items-center ml-auto'>
					<VisuallyHidden>Press </VisuallyHidden>
					<kbd className='no-underline px-2 rounded bg-gray-200'>
						<abbr title={actionKey[1]}>{ACTION_KEY_APPLE[0]}</abbr>
					</kbd>
					<VisuallyHidden> and </VisuallyHidden>
					<kbd className='no-underline px-2 rounded bg-gray-200'>K</kbd>
				</Stack>
			</Box>
		);
	}
);

SearchButton.displayName = 'SearchButton';

export function Search() {
	const router = useRouter();
	const [isOpen, setIsOpen] = React.useState(false);
	const searchButtonRef = React.useRef<HTMLButtonElement | null>(null);
	const [initialQuery, setInitialQuery] = React.useState<string | undefined>();

	const onOpen = React.useCallback(() => {
		setIsOpen(true);
	}, [setIsOpen]);

	const onClose = React.useCallback(() => {
		setIsOpen(false);
	}, [setIsOpen]);

	const onInput = React.useCallback(
		(e) => {
			setIsOpen(true);
			setInitialQuery(e.key);
		},
		[setIsOpen, setInitialQuery]
	);

	useDocSearchKeyboardEvents({
		isOpen,
		onOpen,
		onClose,
		onInput,
		searchButtonRef,
	});

	return (
		<>
			<SearchButton onClick={onOpen} ref={searchButtonRef} />
			{isOpen && (
				<Portal>
					<DocSearchModal
						placeholder='Search the docs'
						initialQuery={initialQuery}
						initialScrollY={window.scrollY}
						onClose={onClose}
						indexName='nature-ui'
						apiKey='0d8256bb9d09856b576409dfb05103af'
						appId='BH4D9OD16A'
						navigator={{
							navigate({ itemUrl }) {
								setIsOpen(false);
								router.push(itemUrl);
							},
						}}
						hitComponent={Hit}
						transformItems={(items) => {
							return items.map((item) => {
								/**
								 *  We transform the absolute URL into a relative URL to
								 *  leverage Next's preloading.
								 */
								const a = document.createElement('a');
								a.href = item.url;
								const hash = a.hash === '#content-wrapper' ? '' : a.hash;

								return {
									...item,
									url: `${a.pathname}${hash}`,
									content: item.content ?? item.hierarchy.lvl0,
								};
							});
						}}
					/>
				</Portal>
			)}
		</>
	);
}
